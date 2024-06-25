import axios from 'axios';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useTitle';
import { Post } from '../../types/Post';
import { User } from '../../types/User';
import { handleApiError } from '../../util/handleApiError';

/**
 * The page displaying the profile of a user.
 */
function Profile() {
	useDocumentTitle('Profile');
	const { userId } = useParams();
	const { user } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [profileData, setProfileData] = useState<User | null>(null);
	const [posts, setPosts] = useState<Post[] | null>([]);

	useEffect(() => {
		/**
		 * Loads the profile data from the server.
		 */
		async function loadProfile() {
			setIsLoading(true);

			try {
				const res1 = await axios.get(`${API}/User/user/${userId}`);
				const user: User = res1.data.user;

				const res2 = await axios.get(`${API}/Post/user/${userId}`);
				const posts: Post[] = res2.data.posts;
				posts.sort((a, b) => {
					if (a.created && b.created) {
						return new Date(b.created).getTime() - new Date(a.created).getTime();
					}
					return 0; // fallback if created is undefined (it should never happen)
				});

				setPosts(posts);
				setProfileData(user);
			} catch (error) {
				const message = handleApiError(error, 'Profile loading failed. Please try again.');
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		loadProfile();
	}, [userId]);

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

			{profileData && (
				<ScrollPanel className='h-screen pb-5'>
					<div className='flex justify-content-center'>
						<div className='w-9'>
							{/* Profile container */}
							<div className='flex flex-column'>
								<h1>{userId == user?.id ? 'Your Profile' : `Profile of ${profileData.email}`}</h1>
								<div className='flex flex-row gap-5'>
									{/* image or placeholder icon */}
									<Avatar
										image={profileData.img_path || undefined}
										icon={profileData.img_path ? undefined : 'pi pi-user'}
										shape='circle'
										size='xlarge'
										className='w-12rem h-12rem'
									/>
									{/* user details */}
									<div className='flex flex-column'>
										{profileData.first_name && profileData.last_name && (
											<p>
												{profileData.first_name} {profileData.last_name}
											</p>
										)}
										<p>{profileData.email}</p>
									</div>
									{/* edit profile link if it's the current user's profile */}
									{user?.id === profileData.id && (
										<Link to={`/edit-profile/${profileData.id}`}>
											<Button icon='pi pi-pencil' className='p-button-outlined'>
												Edit Profile
											</Button>
										</Link>
									)}
								</div>

								{/* posts of the user */}
								<div>
									<h2>Posts</h2>

									<div className='flex flex-row flex-wrap gap-5 justify-content-center'>
										{posts && posts.length > 0 ? (
											posts?.map(post => (
												<Link to={`/post/${post.id}`} className='cursor-pointer'>
													<Image src={post.img_path} alt={post.title} width='200' />
												</Link>
											))
										) : (
											<p>No posts yet</p>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</ScrollPanel>
			)}
		</>
	);
}

export default Profile;
