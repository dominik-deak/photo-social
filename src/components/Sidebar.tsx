import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type SidebarItemProps = {
	to: string;
	icon: string;
	text: string;
};

/**
 * For simple Sidebar items that only have an icon and text
 */
function SidebarItem({ to, icon, text }: SidebarItemProps) {
	return (
		<li>
			<Link
				to={to}
				className='no-underline flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full'>
				<i className={`pi ${icon} mr-2`} />
				<span className='font-medium'>{text}</span>
			</Link>
		</li>
	);
}

/**
 * Creates the sidebar for the app.
 * Includes links to home, post search, create post, profile, and logout.
 */
export default function Sidebar() {
	const { user, logout } = useAuth();

	return (
		<nav className='relative lg:static'>
			<div className='surface-section h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 surface-border select-none w-18rem'>
				<div className='flex flex-column h-full'>
					<div className='flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0'>
						<span className='inline-flex align-items-center gap-2'>
							<span className='font-semibold text-2xl text-primary'>Photo Social</span>
						</span>
					</div>
					<div className='overflow-y-auto'>
						<div className='p-3 m-0'>
							<ul className='list-none p-0 m-0 overflow-hidden'>
								<SidebarItem to='/' icon='pi-home' text='Home' />
								<SidebarItem to='/search' icon='pi-search' text='Search' />
								<SidebarItem to='/create-post' icon='pi-plus-circle' text='Post Image' />
								<li>
									{user && (
										<Link
											to={`/profile/${user.id}`}
											className='no-underline flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors'>
											<Avatar
												image={user.img_path || undefined}
												icon={user.img_path ? undefined : 'pi pi-user'}
												shape='circle'
											/>
											<span className='font-bold'>Your Profile</span>
										</Link>
									)}
								</li>
								<li>
									<Divider className='w-auto mb-3 mx-3' />
								</li>
								<li>
									<span
										onClick={logout}
										className='no-underline flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full'>
										<i className='pi pi-sign-out mr-2' />
										<span className='font-medium'>Log Out</span>
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
