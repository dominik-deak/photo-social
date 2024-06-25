import axios from 'axios';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Image } from 'primereact/image';
import { InputTextarea } from 'primereact/inputtextarea';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { API } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useTitle';
import { Comment } from '../../types/Comment';
import { Post } from '../../types/Post';
import { handleApiError } from '../../util/handleApiError';

/**
 * THe page where a user can view a single post.
 * The displays all details of the post.
 * It also displays all comments on the post, with the option to add a new comment.
 * Non-authors can upvote and downvote the post.
 * The post author can go to the edit post page to edit the post.
 */
function ViewPost() {
	useDocumentTitle('View Post');
	const { user } = useAuth();
	const { postId } = useParams();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [post, setPost] = useState<Post | null>(null);
	const [newComment, setNewComment] = useState('');

	useEffect(() => {
		/**
		 * Loads the post from the server.
		 */
		async function loadPost() {
			setIsLoading(true);
			try {
				const res = await axios.get(`${API}/Post/single/${postId}`);
				const post: Post = res.data.post;
				setPost(post);
			} catch (error) {
				const message = handleApiError(error, 'Post loading failed. Please try again.');
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		loadPost();
	}, [postId]);

	// for debugging
	useEffect(() => {
		console.log(user);
		console.log(post?.comments);
	}, [post?.comments, user]);

	/**
	 * Adds a new comment to the post, by sending it to the server.
	 */
	async function addComment() {
		setIsLoading(true);

		try {
			const res = await axios.post(`${API}/Comment/comment/${postId}`, {
				text: newComment
			});
			const resComment: Comment = res.data.comment;

			setPost(prevPost => {
				if (!prevPost) return prevPost;

				return {
					...prevPost,
					comments: prevPost.comments ? [...prevPost.comments, resComment] : [resComment]
				};
			});

			setNewComment('');
		} catch (error) {
			const message = handleApiError(error, 'Comment creation failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	/**
	 * Upvotes or downvotes a comment, by sending a request to the server.
	 */
	async function commentVote(commentId: number, vote: 'up' | 'down') {
		setIsLoading(true);

		try {
			const res = await axios.post(`${API}/Comment/vote/${commentId}`, { vote: vote });
			const { votes } = res.data;

			setPost(prevPost => {
				if (!prevPost || prevPost.id === undefined) {
					return prevPost;
				}

				return {
					...prevPost,
					comments: prevPost?.comments?.map(comment => {
						if (comment.id === commentId) {
							return {
								...comment,
								upvotes: votes.upvotes,
								downvotes: votes.downvotes
							};
						}
						return comment;
					})
				};
			});
		} catch (error) {
			const message = handleApiError(error, 'Comment voting failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	/**
	 * Deletes a comment (only available to the comment author).
	 */
	async function deleteComment(commentId: number) {
		setIsLoading(true);

		try {
			await axios.delete(`${API}/Comment/comment/${commentId}`);

			setPost(prevPost => {
				if (!prevPost) return prevPost;

				return {
					...prevPost,
					comments: prevPost.comments ? prevPost.comments.filter(comment => comment.id !== commentId) : []
				};
			});
		} catch (error) {
			const message = handleApiError(error, 'Comment deletion failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	/**
	 * Upvotes or downvotes the post, by sending a request to the server.
	 */
	async function postVote(vote: 'up' | 'down') {
		setIsLoading(true);

		try {
			const res = await axios.post(`${API}/Post/vote/${postId}`, { vote: vote });
			const { votes } = res.data;

			setPost(prevPost => {
				if (!prevPost || prevPost.id === undefined) {
					return prevPost;
				}

				return {
					...prevPost,
					upvotes: votes.upvotes,
					downvotes: votes.downvotes
				};
			});
		} catch (error) {
			const message = handleApiError(error, 'Post voting failed. Please try again.');
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

			{post && (
				<ScrollPanel className='flex justify-content-center h-screen pb-8'>
					<div className='flex flex-column w-6 mx-auto'>
						<Image src={post.img_path} alt={post.title} width='500' className='align-self-center' />
						<div className='flex flex-column justify-content-evenly'>
							{post.user_details && (
								<div className='flex flex-row justify-content-evenly'>
									<p>{post.title}</p>
									<Link
										to={`/profile/${post.user_details.id}`}
										className='cursor-pointer flex align-items-center align-self-center'>
										{/* poster image with link to their profile */}
										<Avatar
											image={post.user_details.img_path || undefined}
											icon={post.user_details.img_path ? undefined : 'pi pi-user'}
											shape='circle'
										/>
										{/* poster name/email with link to their profile */}
										<span className='ml-3'>
											{post.user_details.first_name && post.user_details.last_name
												? `${post.user_details.first_name} ${post.user_details.last_name}`
												: post.user_details.email}
										</span>
									</Link>
								</div>
							)}

							<div className='flex flex-row justify-content-evenly gap-8'>
								<p>{post.desc}</p>
								<p>{post.tags.split(',').map(tag => `#${tag} `)}</p>
							</div>

							{/* voting options if post is not by the current user */}
							{user && user.id !== post.user_details?.id && (
								<div className='flex flex-row gap-2 align-self-center'>
									<Button
										onClick={() => postVote('up')}
										label={`${post.upvotes || 0}`}
										icon='pi pi-arrow-up'
										className='mr-3 w-5rem h-2rem'
									/>
									<Button
										onClick={() => postVote('down')}
										label={`${post.downvotes || 0}`}
										icon='pi pi-arrow-down'
										className='mr-3 w-5rem h-2rem'
									/>
								</div>
							)}

							{/* edit post option if user is the poster */}
							{user && post.user_details?.id && user.id === post.user_details?.id && (
								<Link
									to={`/edit-post/${post.id}`}
									className='mt-1 mb-3 align-self-center'
									style={{ width: 'fit-content' }}>
									<Button icon='pi pi-pencil' className='p-button-outlined'>
										Edit Post
									</Button>
								</Link>
							)}

							<Divider />

							{/* comments */}
							{post.comments && post.comments.length > 0 ? (
								<div>
									{post.comments.map(comment => (
										<>
											<div key={comment.id} className='flex flex-row justify-content-between mb-1'>
												{/* commenter details with link to their profile */}
												<Link
													to={`/profile/${comment.user_id}`}
													className='cursor-pointer flex align-items-center'>
													<Avatar
														image={comment.img_path || undefined}
														icon={comment.img_path ? undefined : 'pi pi-user'}
														shape='circle'
													/>
													{comment.first_name && comment.last_name ? (
														<span>
															{comment.first_name} {comment.last_name}
														</span>
													) : (
														<span>{comment.email}</span>
													)}
												</Link>

												<p>{comment.text}</p>

												<div className='flex flex-row'>
													{/* voting options if comment is not by the current user */}
													{user && parseInt(user.id) != comment.user_id && (
														<div className='flex flex-column gap-2'>
															<Button
																onClick={() => commentVote(comment.id, 'up')}
																label={`${comment.upvotes || 0}`}
																icon='pi pi-arrow-up'
																className='mr-3 w-5rem h-2rem'
															/>
															<Button
																onClick={() => commentVote(comment.id, 'down')}
																label={`${comment.downvotes || 0}`}
																icon='pi pi-arrow-down'
																className='mr-3 w-5rem h-2rem'
															/>
														</div>
													)}

													{/* delete comment option if user is the poster */}
													{user && parseInt(user.id) == comment.user_id && (
														<Button
															onClick={() => deleteComment(comment.id)}
															icon='pi pi-trash'
															severity='danger'
														/>
													)}
												</div>
											</div>
											<Divider />
										</>
									))}
								</div>
							) : (
								<p className='text-center'>No comments yet</p>
							)}

							{/* new comment form */}
							<div className='flex flex-column'>
								<label htmlFor='new-comment' className='mb-1'>
									Enter New Comment
								</label>
								<InputTextarea
									value={newComment}
									onChange={e => setNewComment(e.target.value)}
									id='new-comment'
									aria-describedby='new-comment-help'
									className='w-full'
								/>
								<Button
									onClick={addComment}
									type='button'
									icon='pi pi-send'
									label='Add Comment'
									className='w-full mt-3'
								/>
							</div>
						</div>
					</div>
				</ScrollPanel>
			)}
		</>
	);
}

export default ViewPost;
