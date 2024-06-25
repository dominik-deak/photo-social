import { Link } from 'react-router-dom';

/**
 * Not found component from react-router documentation:
 * https://reactrouter.com/en/main/start/tutorial
 */
function NotFound() {
	return (
		<div>
			<h1>Oops!</h1>
			<p>Sorry, this route does not exist.</p>
			<Link to='/'>Back to Home</Link>
		</div>
	);
}

export default NotFound;
