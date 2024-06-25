import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type PublicRouteProps = PropsWithChildren;

/**
 * Component to disallow access to public routes
 * if a user is already logged in.
 * Source: https://github.com/cosdensolutions/code/tree/master/videos/long/custom-protected-route-component
 * (used as base implementation, then customised to my needs)
 */
function PublicRoute({ children }: PublicRouteProps) {
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user !== null) {
			navigate('/', { replace: true });
		}
	}, [navigate, user]);

	return children;
}

export default PublicRoute;
