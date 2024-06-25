import axios from 'axios';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useTitle';
import { User, UserFormData } from '../../types/User';
import { handleApiError } from '../../util/handleApiError';

/**
 * The page where a user can edit their own profile.
 */
function EditProfile() {
	useDocumentTitle('Edit Profile');
	const { userId } = useParams();
	const { user, deleteAccount } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	const [pwModalOpen, setPwModalOpen] = useState(false);
	const [passwords, setPasswords] = useState({
		password: '',
		confirmPassword: ''
	});

	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [originalProfileData, setOriginalProfileData] = useState({
		first_name: '',
		last_name: '',
		img_path: ''
	});
	const [newProfileData, setNewProfileData] = useState<UserFormData>({
		first_name: '',
		last_name: '',
		img_path: ''
	});

	useEffect(() => {
		/**
		 * Loads the profile data from the server.
		 */
		async function loadProfile() {
			// if it's not the current user trying to edit, redirect
			userId !== user?.id && navigate(`/profile/${userId}`, { replace: true });

			setIsLoading(true);

			try {
				const res = await axios.get(`${API}/User/user/${userId}`);
				const user: User = res.data.user;
				setOriginalProfileData({
					first_name: user.first_name || '',
					last_name: user.last_name || '',
					img_path: user.img_path || ''
				});
				setNewProfileData({
					first_name: user.first_name || '',
					last_name: user.last_name || '',
					img_path: user.img_path || ''
				});
			} catch (error) {
				const message = handleApiError(error, 'Profile loading failed. Please try again.');
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		loadProfile();
	}, [navigate, user, userId]);

	/**
	 * Changes the files in state
	 */
	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
			setNewProfileData({ ...newProfileData, img_path: '' });
		}
	}

	/**
	 * Triggers the hidden file input
	 */
	function triggerFileSelectPopup() {
		fileInputRef.current?.click();
	}

	/**
	 * Check if originalProfileData and newProfileData are equal.
	 * (If they are, no API call is needed)
	 */
	function checkProfileChange() {
		return JSON.stringify(originalProfileData) !== JSON.stringify(newProfileData);
	}

	/**
	 * Sends an update request to the server, to update the profile.
	 *
	 * Using post instead of put for this update,
	 * because php doesn't support file uploads with put.
	 * `multipart/form-data` is only available for post.
	 *
	 * Sources describing my problem:
	 * - https://stackoverflow.com/a/9469615
	 * - https://codereview.stackexchange.com/q/69882
	 */
	async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!checkProfileChange()) {
			console.log('No profile change');
			navigate(`/profile/${userId}`);
			return;
		}

		setIsLoading(true);

		const data = new FormData();
		if (file) data.append('file', file);
		data.append('first_name', newProfileData.first_name);
		data.append('last_name', newProfileData.last_name);
		data.append('img_path', newProfileData.img_path);

		try {
			await axios.post(`${API}/User/user/${userId}`, data, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			setSuccess('Profile updated successfully');
		} catch (error) {
			const message = handleApiError(error, 'Profile update failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	/**
	 * Checks if the passwords match
	 */
	function validatePasswords() {
		if (passwords.password !== passwords.confirmPassword) {
			setError('Passwords do not match');
			return false;
		}
		return true;
	}

	/**
	 * Calls the delete account function from the auth context
	 */
	async function handleDeleteAccount() {
		if (!validatePasswords()) return;
		setIsLoading(true);

		if (!passwords) {
			setError('Enter password');
			setIsLoading(false);
			return;
		}

		try {
			// will automatically redirect to login (see context provider)
			await deleteAccount(passwords.password);
		} catch (error) {
			const message = handleApiError(error, 'Account deletion failed. Please try again.');
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
				onHide={() => navigate(`/profile/${userId}`)}>
				<p className='m-0'>{success}</p>
			</Dialog>

			{/* password confirmation modal */}
			<Dialog
				visible={pwModalOpen}
				modal
				onHide={() => setPwModalOpen(false)}
				content={({ hide }) => (
					<div className='flex flex-column px-8 py-5 gap-4 bg-white border-round-2xl'>
						<div>
							<label htmlFor='password' className='block text-900 font-medium mb-2'>
								Password
							</label>
							<InputText
								id='password'
								type='password'
								placeholder='Password'
								className='w-full mb-3'
								value={passwords.password}
								onChange={e => setPasswords({ ...passwords, password: e.target.value })}
								disabled={isLoading}
							/>
							<label htmlFor='password' className='block text-900 font-medium mb-2'>
								Confirm Password
							</label>
							<InputText
								id='password'
								type='password'
								placeholder='Confirm Password'
								className='w-full mb-3'
								value={passwords.confirmPassword}
								onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
								disabled={isLoading}
							/>
						</div>
						<div className='flex justify-content-evenly'>
							<Button onClick={handleDeleteAccount} label='Delete' security='danger' type='button' rounded />
							<Button onClick={hide} label='Cancel' type='button' rounded outlined />
						</div>
					</div>
				)}
			/>

			{/* form with profile data */}
			{newProfileData && (
				<div className='flex justify-content-center'>
					<div className='flex flex-column'>
						<form onSubmit={updateProfile} className='flex flex-column'>
							{/* existing image or placeholder icon */}
							<Avatar
								image={newProfileData.img_path || undefined}
								icon={newProfileData.img_path ? undefined : 'pi pi-user'}
								shape='circle'
								size='xlarge'
								className='w-8rem h-8rem align-self-center'
							/>
							<div className='mt-3 align-self-center'>
								<div className='flex flex-column'>
									<label htmlFor='post-file' className='align-self-center text-center'>
										New Profile Image
									</label>
									<input
										type='file'
										name='file'
										id='post-file'
										style={{ display: 'none' }}
										ref={fileInputRef}
										onChange={handleFileChange}
										accept='image/jpeg, image/png'
									/>
								</div>
								<Button
									label={file ? `File: ${file.name}` : 'Attach Image'}
									icon='pi pi-plus'
									onClick={triggerFileSelectPopup}
									className={`mt-3 p-button-outlined ${file ? 'p-button-success' : ''}`}
									type='button'
								/>
							</div>

							<div className='flex flex-column gap-3 mt-3'>
								<label htmlFor='first-name'>First Name</label>
								<InputText
									value={newProfileData.first_name}
									onChange={e => setNewProfileData({ ...newProfileData, first_name: e.target.value })}
									id='first-name'
									aria-describedby='first-name-help'
								/>

								<label htmlFor='last-name'>Last Name</label>
								<InputText
									value={newProfileData.last_name}
									onChange={e => setNewProfileData({ ...newProfileData, last_name: e.target.value })}
									id='last-name'
									aria-describedby='last-name-help'
								/>

								<Button type='submit' label='Update Profile' />
								<Button
									onClick={() => setPwModalOpen(true)}
									type='button'
									label='Delete Profile'
									severity='danger'
								/>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default EditProfile;
