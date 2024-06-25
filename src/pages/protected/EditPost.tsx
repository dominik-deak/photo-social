import axios from 'axios';
import { Button } from 'primereact/button';
import { Chips, ChipsChangeEvent } from 'primereact/chips';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useTitle';
import { Post, PostData } from '../../types/Post';
import { handleApiError } from '../../util/handleApiError';

/**
 * The page where users can edit their posts.
 */
function EditPost() {
	useDocumentTitle('Edit Post');
	const { postId } = useParams();
	const { user } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	const [originalPostData, setOriginalPostData] = useState<PostData>({
		img_path: '',
		title: '',
		desc: '',
		tags: []
	});
	const [newPostData, setNewPostData] = useState<PostData>({
		title: '',
		desc: '',
		tags: []
	});

	useEffect(() => {
		/**
		 * Loads the post data.
		 */
		async function loadPost() {
			setIsLoading(true);
			try {
				const res = await axios.get(`${API}/Post/single/${postId}`);
				const post: Post = res.data.post;

				// if it's not the current user trying to edit, redirect
				post.user_details?.id !== user?.id && navigate(`/post/${postId}`, { replace: true });

				setOriginalPostData({
					img_path: post.img_path,
					title: post.title,
					desc: post.desc,
					tags: post.tags && post.tags.length > 0 ? post.tags.split(',') : []
				});
				setNewPostData({
					title: post.title,
					desc: post.desc,
					tags: post.tags && post.tags.length > 0 ? post.tags.split(',') : []
				});
			} catch (error) {
				const message = handleApiError(error, 'Post loading failed. Please try again.');
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		loadPost();
	}, [navigate, postId, user?.id]);

	/**
	 * Checks if all the required fields have been filled in.
	 */
	function validate() {
		if (
			originalPostData.title === newPostData.title &&
			originalPostData.desc === newPostData.desc &&
			originalPostData.tags.join(',') === newPostData.tags.join(',')
		) {
			console.log('No post change');
			navigate(`/post/${postId}`);
		}

		if (!newPostData.title) {
			setError('Please enter a title');
			return false;
		}
		if (!newPostData.desc) {
			setError('Please enter a description');
			return false;
		}
		if (!newPostData.tags.length) {
			setError('Please enter at least one tag');
			return false;
		}
		return true;
	}

	/**
	 * Sends the new post data to the server for updating.
	 */
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!validate()) return;
		setIsLoading(true);

		try {
			await axios.put(`${API}/Post/post/${postId}`, {
				title: newPostData.title,
				desc: newPostData.desc,
				tags: newPostData.tags.join(',')
			});
			setSuccess('Post updated successfully');
		} catch (error) {
			const message = handleApiError(error, 'Post update failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	/**
	 * Activates the delete confirmation dialog.
	 */
	function confirmDelete() {
		confirmDialog({
			message: 'Do you want to delete this post?',
			header: 'Delete Confirmation',
			icon: 'pi pi-info-circle',
			defaultFocus: 'reject',
			acceptClassName: 'p-button-danger',
			accept: deletePost
		});
	}

	/**
	 * Sends a delete request to the server, to delete the post.
	 */
	async function deletePost() {
		setIsLoading(true);

		try {
			await axios.delete(`${API}/Post/post/${postId}`);
			setSuccess('Post deleted successfully');
		} catch (error) {
			const message = handleApiError(error, 'Post deletion failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{isLoading && <LoadingModal />}
			<ConfirmDialog />
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

			<h1 className='text-center mb-8'>Edit Post</h1>
			<div className='flex justify-content-center'>
				<form onSubmit={handleSubmit} className='w-6 flex flex-column'>
					<Image src={newPostData.img_path} alt={newPostData.title} width='300' className='align-self-center mb-5' />

					<div className='flex flex-column gap-3'>
						<label htmlFor='post-title'>Post Title</label>
						<InputText
							value={newPostData.title}
							onChange={e => setNewPostData({ ...newPostData, title: e.target.value })}
							id='post-title'
							aria-describedby='post-title-help'
						/>

						<label htmlFor='post-description'>Post Description</label>
						<InputTextarea
							value={newPostData.desc}
							onChange={e => setNewPostData({ ...newPostData, desc: e.target.value })}
							id='post-description'
							aria-describedby='post-description-help'
							rows={5}
						/>

						<label>Tags</label>
						<small>Press Enter to add tags</small>
						<Chips
							value={newPostData.tags}
							onChange={(e: ChipsChangeEvent) => setNewPostData({ ...newPostData, tags: e.value || [] })}
							className='block'
						/>

						<Button type='submit' label='Update Post' />
						<Button onClick={confirmDelete} type='button' label='Delete Post' severity='danger' />
					</div>
				</form>
			</div>
		</>
	);
}

export default EditPost;
