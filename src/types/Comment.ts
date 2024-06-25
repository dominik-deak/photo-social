export type Comment = {
	id: number;
	post_id: number;
	user_id: number;
	text: string;
	created: Date;

	// commenter details
	email: string;
	first_name: string | null;
	last_name: string | null;
	img_path: string | null;

	// votes
	upvotes: number;
	downvotes: number;
};
