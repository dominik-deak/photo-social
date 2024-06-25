import { Comment } from './Comment';
import { User } from './User';

export type Post = {
	id: number;
	title: string;
	desc: string;
	tags: string; // comma separated string of strings
	img_path: string;

	// may be removed when extra data is added
	user_id?: number;
	created?: Date;
	updated?: Date;

	// added from analytics
	upvotes: number;
	downvotes: number;
	comments_count: number;

	// added when retrieving an existing post
	user_details?: User;
	comments?: Comment[];
};

export type PostData = {
	img_path?: string;
	title: string;
	desc: string;
	tags: string[];
};

export type PostSubmission = {
	title: string;
	desc: string;
	tags: string; // comma separated string of strings
};
