import axios from 'axios';
import { Button } from 'primereact/button';
import { Chips, ChipsChangeEvent } from 'primereact/chips';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useTitle';
import { PostData } from '../../types/Post';
import { handleApiError } from '../../util/handleApiError';

/**
 * The page where users can create a new post.
 * Has a form with fields for title, description, and tags,
 * and a file upload button.
 */
function CreatePost() {
	useDocumentTitle('Create Post');
	const { user } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [postData, setPostData] = useState<PostData>({
		title: '',
		desc: '',
		tags: []
	});

	/**
	 * Sets the attached file in state.
	 */
	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
		}
	}

	/**
	 * Triggers the hidden file input
	 */
	function triggerFileSelectPopup() {
		fileInputRef.current?.click();
	}

	/**
	 * Checks if all the required fields have been filled in.
	 */
	function validate() {
		if (!file) {
			setError('Please upload an image');
			return false;
		}
		if (!postData.title) {
			setError('Please enter a title');
			return false;
		}
		if (!postData.desc) {
			setError('Please enter a description');
			return false;
		}
		if (!postData.tags.length) {
			setError('Please enter at least one tag');
			return false;
		}
		return true;
	}

	/**
	 * Handles the creation of a new post.
	 * Sends a POST request to the CodeIgniter API with the form data.
	 * Event type source:
	 * https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/
	 */
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!validate()) return;
		setIsLoading(true);

		const data = new FormData();
		if (file) data.append('file', file);
		data.append('title', postData.title);
		data.append('desc', postData.desc);
		data.append('tags', postData.tags.join(','));

		try {
			await axios.post(`${API}/Post/post`, data, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			setSuccess('Post created successfully');
		} catch (error) {
			const message = handleApiError(error, 'Post creation failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{isLoading && <LoadingModal />}
			<Dialog
				header='Error'
				visible={error ? true : false}
				style={{ width: '40vw' }}
				breakpoints={{ '960px': '75vw', '641px': '100vw' }}
				onHide={() => setError('')}>
				<p className='m-0'>{error}</p>
			</Dialog>
			<Dialog
				header='Success'
				visible={success ? true : false}
				style={{ width: '40vw' }}
				breakpoints={{ '960px': '75vw', '641px': '100vw' }}
				onHide={() => {
					user && navigate(`/profile/${user.id}`, { replace: true });
				}}>
				<p className='m-0'>{success}</p>
			</Dialog>

			<h1 className='text-center mb-8'>Create a Post</h1>
			<div className='flex justify-content-center'>
				<form onSubmit={handleSubmit} className='w-6'>
					<label htmlFor='post-file'>Attach Image</label>
					<div className='flex justify-content-center'>
						<input
							type='file'
							name='file'
							id='post-file'
							style={{ display: 'none' }}
							ref={fileInputRef}
							onChange={handleFileChange}
							accept='image/jpeg, image/png'
						/>
						<Button
							label={file ? `File: ${file.name}` : 'Attach Image'}
							icon='pi pi-plus'
							onClick={triggerFileSelectPopup}
							className={`mt-3 p-button-outlined ${file ? 'p-button-success' : ''}`}
							type='button'
						/>
					</div>

					<div className='flex flex-column gap-3'>
						<label htmlFor='post-title'>Post Title</label>
						<InputText
							value={postData.title}
							onChange={e => setPostData({ ...postData, title: e.target.value })}
							id='post-title'
							aria-describedby='post-title-help'
						/>

						<label htmlFor='post-description'>Post Description</label>
						<InputTextarea
							value={postData.desc}
							onChange={e => setPostData({ ...postData, desc: e.target.value })}
							id='post-description'
							aria-describedby='post-description-help'
							rows={5}
						/>

						<label>Tags</label>
						<small>After typing, press Enter to add tags</small>
						<Chips
							value={postData.tags}
							onChange={(e: ChipsChangeEvent) => setPostData({ ...postData, tags: e.value || [] })}
							className='block'
						/>

						<Button type='submit' label='Create Post' />
					</div>
				</form>
			</div>
		</>
	);
}

export default CreatePost;
