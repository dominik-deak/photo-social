import axios from 'axios';

/**
 * Formats error based on its type
 * @param error the original error
 * @param defaultMessage the default error message for the user
 * @returns the formatted error message
 */
export function handleApiError(error: unknown, defaultMessage: string) {
	let message: string;
	if (axios.isAxiosError(error)) {
		message = error.response?.data.error || defaultMessage;
	} else if (error instanceof Error) {
		message = error.message;
	} else {
		message = 'An unexpected error occurred.';
	}
	console.error(message);
	return message;
}
