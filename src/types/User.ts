export type User = {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	img_path: string | null;
	created: Date;
	updated: Date;
};

export type UserFormData = {
	first_name: string;
	last_name: string;
	img_path: string;
};
