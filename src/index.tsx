import axios from 'axios';
import { PrimeReactProvider } from 'primereact/api';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

// Enabling cookies with all axios requests to send PHP session cookie
// Source: https://bobbyhadz.com/blog/javascript-axios-set-cookies#setting-the-withcredentials-property-globally
axios.defaults.withCredentials = true;

// Prime UI
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
// Custom styles
import './index.css';

// Auth components
import AuthProvider from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
// Public pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Protected pages
import Layout from './components/Layout';
import CreatePost from './pages/protected/CreatePost';
import EditPost from './pages/protected/EditPost';
import EditProfile from './pages/protected/EditProfile';
import Home from './pages/protected/Home';
import Profile from './pages/protected/Profile';
import Search from './pages/protected/Search';
import ViewPost from './pages/protected/ViewPost';
// Misc pages
import NotFound from './pages/misc/NotFound';

/**
 * Using hash router because university apache server
 * would treat each route as a directory,
 * breaking the app when using a browser router with URLs
 */
const router = createHashRouter([
	{
		path: '/register',
		element: (
			<PublicRoute>
				<Register />
			</PublicRoute>
		),
		errorElement: <NotFound />
	},
	{
		path: '/login',
		element: (
			<PublicRoute>
				<Login />
			</PublicRoute>
		),
		errorElement: <NotFound />
	},
	{
		path: '/',
		element: (
			<ProtectedRoute>
				<Layout />
			</ProtectedRoute>
		),
		errorElement: <NotFound />,
		children: [
			{
				index: true,
				element: <Home />,
				errorElement: <NotFound />
			},
			{
				path: 'create-post',
				element: <CreatePost />,
				errorElement: <NotFound />
			},
			{
				path: 'edit-post/:postId',
				element: <EditPost />,
				errorElement: <NotFound />
			},
			{
				path: 'post/:postId',
				element: <ViewPost />,
				errorElement: <ViewPost />
			},
			{
				path: 'search',
				element: <Search />,
				errorElement: <NotFound />
			},
			{
				path: 'profile/:userId',
				element: <Profile />,
				errorElement: <NotFound />
			},
			{
				path: 'edit-profile/:userId',
				element: <EditProfile />,
				errorElement: <NotFound />
			}
		]
	},
	{ path: '*', element: <NotFound /> }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<AuthProvider>
			<PrimeReactProvider>
				<RouterProvider router={router} />
			</PrimeReactProvider>
		</AuthProvider>
	</React.StrictMode>
);
