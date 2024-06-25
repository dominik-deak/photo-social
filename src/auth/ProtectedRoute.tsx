import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = PropsWithChildren;

/**
 * Component to protect routes from unauthenticated users
 * Source: https://github.com/cosdensolutions/code/tree/master/videos/long/custom-protected-route-component
 * (used as base implementation, then customised to my needs)
 *
 * Unauthenticated users will be redirected to the login page
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user === null) {
			navigate('/login', { replace: true });
		}
	}, [navigate, user]);

	return children;
}

export default ProtectedRoute;
