import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Defines the layout of the app,
 * including the sidebar and the rest of the site.
 */
function Layout() {
	return (
		<div className='flex min-h-screen'>
			<Sidebar />
			<main className='p-4 w-full'>
				<Outlet /> {/* Rest of the site */}
			</main>
		</div>
	);
}

export default Layout;
