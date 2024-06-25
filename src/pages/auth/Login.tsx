import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider';
import { useDocumentTitle } from '../../hooks/useTitle';
import { handleApiError } from '../../util/handleApiError';

/**
 * The login page.
 * Has a form that allows users to login.
 */
function Login() {
	useDocumentTitle('Login');
	const { login } = useContext(AuthContext);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	/**
	 * Handles the login of a user.
	 * Uses the login method from the AuthContext.
	 */
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		if (!email || !password) {
			setError('Please fill in all fields.');
			setIsLoading(false);
			return;
		}

		try {
			await login(email, password);
		} catch (error) {
			const message = handleApiError(error, 'Login failed. Please try again.');
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<Dialog
				header='Error'
				visible={error ? true : false}
				style={{ width: '40vw' }}
				breakpoints={{ '960px': '75vw', '641px': '100vw' }}
				onHide={() => setError('')}>
				<p className='m-0'>{error}</p>
			</Dialog>

			<div className='mt-8 flex align-items-center justify-content-center'>
				<div className='p-4 shadow-2 border-round w-full lg:w-6 bg-white'>
					<div className='text-center mb-5'>
						<div className='text-900 text-3xl font-medium mb-3'>Welcome Back to Photo Social</div>
						<span className='text-600 font-medium line-height-3'>Don't have an account?</span>
						<Link className='font-medium no-underline ml-2 text-blue-500 cursor-pointer' to='/register'>
							Register here
						</Link>
					</div>

					<form onSubmit={handleSubmit}>
						<label htmlFor='email' className='block text-900 font-medium mb-2'>
							Email
						</label>
						<InputText
							id='email'
							type='email'
							placeholder='Email address'
							className='w-full mb-3'
							value={email}
							onChange={e => setEmail(e.target.value)}
							disabled={isLoading}
						/>

						<label htmlFor='password' className='block text-900 font-medium mb-2'>
							Password
						</label>
						<InputText
							id='password'
							type='password'
							placeholder='Password'
							className='w-full mb-3'
							value={password}
							onChange={e => setPassword(e.target.value)}
							disabled={isLoading}
						/>

						<Button
							type='submit'
							className='w-full mt-4'
							label={isLoading ? 'Logging in...' : 'Log In'}
							icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user'}
							disabled={isLoading}
						/>
					</form>
				</div>
			</div>
		</>
	);
}

export default Login;
