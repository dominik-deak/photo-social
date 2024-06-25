import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useTitle';
import { Post } from '../../types/Post';
import { handleApiError } from '../../util/handleApiError';

/**
 * The Home page.
 * Loads the latest posts.
 */
function Home() {
	useDocumentTitle('Home');
	const { user } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [posts, setPosts] = useState<Post[] | null>(null);

	useEffect(() => {
		/**
		 * Loads the latest posts from the server.
		 */
		async function loadPosts() {
			setIsLoading(true);

			try {
				const res = await axios.get(`${API}/Post/all`);
				const posts: Post[] = res.data.posts;
				// sort posts by date
				posts.sort((a, b) => {
					if (a.created && b.created) {
						return new Date(b.created).getTime() - new Date(a.created).getTime();
					}
					return 0; // fallback if created is undefined (it should never happen)
				});
				setPosts(posts);
			} catch (error) {
				const message = handleApiError(error, 'Post loading failed. Please try again.');
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		user && loadPosts();
	}, [user]);

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

			<div className='flex justify-content-center w-full h-screen'>
				<ScrollPanel>
					{posts && posts.length > 0 ? (
						posts.map(post => (
							<div className='mb-8'>
								<Link to={`/post/${post.id}`} className='cursor-pointer'>
									<Image src={post.img_path} alt={post.title} width='300' />
								</Link>
								<Link to={`/post/${post.id}`} className='no-underline ml-2 text-primary-700 cursor-pointer'>
									<p>{post.title}</p>
									<span className='mr-2'>
										<i className='pi pi-arrow-up mr-1' />
										{post.upvotes || 0}
									</span>
									<span className='mr-2'>
										<i className='pi pi-arrow-down mr-1' />
										{post.downvotes || 0}
									</span>
									<span className='mr-2'>
										<i className='pi pi-comment mr-1' />
										{post.comments_count || 0}
									</span>
								</Link>
							</div>
						))
					) : (
						<p>No posts yet.</p>
					)}
				</ScrollPanel>
			</div>
		</>
	);
}

export default Home;
