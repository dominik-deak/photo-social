import { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';

/**
 * Custom hook to use provided access to the auth context.
 */
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
};
