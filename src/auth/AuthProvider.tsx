// Auth provider method source:
// https://www.youtube.com/watch?v=eFPvXGZETiY
// (used as base implementation, then customised to my needs)

import axios from 'axios';
import { PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import { API } from '../config';
import { User } from '../types/User';

/**
 * Initial context type
 * Source: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
 */
interface AuthContextType {
	user: User | null;
	register: (email: string, password: string) => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	deleteAccount: (password: string) => Promise<void>;
}

/**
 * Initial function return types
 * Source: https://bobbyhadz.com/blog/typescript-type-promise-is-not-assignable-to-type
 */
const initialContextValue: AuthContextType = {
	user: null,
	register: () => Promise.resolve(),
	login: () => Promise.resolve(),
	logout: () => Promise.resolve(),
	deleteAccount: () => Promise.resolve()
};

/**
 * The auth context
 */
export const AuthContext = createContext<AuthContextType>(initialContextValue);

/**
 * The global provider for the context.
 * Functions use useCallback for memoization (reduces re-renders).
 * Source: https://react.dev/reference/react/useCallback
 */
export default function AuthProvider({ children }: PropsWithChildren) {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		/**
		 * Checks if user has an active session on the server.
		 * If they do, the user object is retrieved and stored in state.
		 */
		async function checkSession() {
			try {
				const response = await axios.get(`${API}/Auth/session`);
				if (!response.data.isAuthenticated) {
					setUser(null);
					return;
				}
				setUser({
					...response.data.user,
					created: new Date(response.data.user.created),
					updated: new Date(response.data.user.updated)
				});
			} catch (error) {
				console.error('Session check failed:', error);
				setUser(null);
			}
		}

		checkSession();
	}, []);

	/**
	 * Calls register endpoint
	 */
	const register = useCallback(async (email: string, password: string) => {
		await axios.post(`${API}/Auth/register`, {
			email: email,
			password: password
		});
	}, []);

	/**
	 * Calls login endpoint
	 */
	const login = useCallback(async (email: string, password: string) => {
		const response = await axios.post(`${API}/Auth/login`, {
			email: email,
			password: password
		});
		if (response.data.user) {
			const loggedInUser: User = {
				...response.data.user,
				created: new Date(response.data.user.created),
				updated: new Date(response.data.user.updated)
			};
			setUser(loggedInUser);
			console.log('loggedInUser: ', loggedInUser);
		} else {
			throw new Error('Login failed');
		}
	}, []);

	/**
	 * Calls logout endpoint
	 */
	const logout = useCallback(async () => {
		await axios.get(`${API}/Auth/logout`);
		setUser(null);
	}, []);

	/**
	 * Sets user state to null.
	 * Only to be used after account deletion.
	 */
	const deleteAccount = useCallback(async (password: string) => {
		await axios.delete(`${API}/Auth/account`, {
			data: { password }
		});
		setUser(null);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				register,
				login,
				logout,
				deleteAccount
			}}>
			{children}
		</AuthContext.Provider>
	);
}
