import axios from 'axios';
import { Button } from 'primereact/button';
import { Chips, ChipsChangeEvent } from 'primereact/chips';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { InputText } from 'primereact/inputtext';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useDocumentTitle } from '../../hooks/useTitle';
import { Post } from '../../types/Post';
import { handleApiError } from '../../util/handleApiError';

/**
 * The page where users can search for posts
 * using a search term and tags.
 */
function Search() {
	useDocumentTitle('Search');

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [searchTerm, setSearchTerm] = useState('');
	const [searchTags, setSearchTags] = useState<string[]>([]);

	const [posts, setPosts] = useState<Post[] | null>(null);

	useEffect(() => {
		/**
		 * Loads the initial posts from the server.
		 */
		async function loadPosts() {
			setIsLoading(true);

			try {
				const res = await axios.get(`${API}/Post/all`);
				const posts: Post[] = res.data.posts;
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

		loadPosts();
	}, []);

	/**
	 * Sends the search request to the server.
	 * Uses the response to update the posts state.
	 */
	async function search() {
		setIsLoading(true);

		try {
			const res = await axios.post(`${API}/Post/search`, {
				searchTerm: searchTerm,
				searchTags: searchTags
			});
			const newPosts: Post[] = res.data.posts;
			newPosts.sort((a, b) => {
				if (a.created && b.created) {
					return new Date(b.created).getTime() - new Date(a.created).getTime();
				}
				return 0; // fallback if created is undefined (it should never happen)
			});
			setPosts(newPosts);
		} catch (error) {
			const message = handleApiError(error, 'Search failed. Please try again.');
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

			<ScrollPanel className='h-screen pb-5'>
				{/* search */}
				<div className='flex flex-column align-items-center'>
					<div className='flex flex-column'>
						<label className='mb-2' htmlFor='search-term'>
							Search Term
						</label>
						<InputText
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							id='search-term'
							aria-describedby='search-term-help'
						/>
					</div>

					<div className='mt-3'>
						<div className='flex flex-column mb-2'>
							<label>Tags</label>
							<small>After typing, press Enter to add tags</small>
						</div>
						<Chips
							value={searchTags}
							onChange={(e: ChipsChangeEvent) => setSearchTags(e.value || [])}
							className='block'
						/>
					</div>

					<Button onClick={search} type='button' label='Search' className='mt-3' />
				</div>

				{/* found images */}

				<div className='flex flex-row flex-wrap gap-5 justify-content-center mt-5'>
					{posts && posts.length > 0 ? (
						posts?.map(post => (
							<div>
								<Link to={`/post/${post.id}`} className='cursor-pointer'>
									<Image src={post.img_path} alt={post.title} width='200' />
								</Link>
							</div>
						))
					) : (
						<p>No posts found</p>
					)}
				</div>
			</ScrollPanel>
		</>
	);
}

export default Search;
