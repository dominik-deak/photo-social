import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider';
import { useDocumentTitle } from '../../hooks/useTitle';
import { handleApiError } from '../../util/handleApiError';

/**
 * The register page.
 * Has a form to register a new user.
 */
function Register() {
	useDocumentTitle('Register');
	const { register } = useContext(AuthContext);
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPass, setConfirmPass] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	/**
	 * Handles the registration of a new user.
	 * Uses the register method from the AuthContext.
	 * If successful, the user is redirected to the login page.
	 * Event type source: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/
	 */
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		if (!email || !password || !confirmPass) {
			setError('Please fill in all fields.');
			setIsLoading(false);
			return;
		}
		if (password !== confirmPass) {
			setError('Passwords do not match.');
			setIsLoading(false);
			return;
		}

		try {
			await register(email, password);
			setSuccess(
				'Congratulations! You have successfully set up your Photo Social account. You may now log in and begin sharing your pictures.'
			);
		} catch (error) {
			const message = handleApiError(error, 'Registration failed. Please try again.');
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

			<Dialog
				header='Success'
				visible={success ? true : false}
				style={{ width: '40vw' }}
				breakpoints={{ '960px': '75vw', '641px': '100vw' }}
				onHide={() => navigate('/login')}>
				<p className='m-0'>{success}</p>
			</Dialog>

			<div className='mt-8 flex align-items-center justify-content-center'>
				<div className='p-4 shadow-2 border-round w-full lg:w-6 bg-white'>
					<div className='text-center mb-5'>
						<div className='text-900 text-3xl font-medium mb-3'>Register on Photo Social</div>
						<span className='text-600 font-medium line-height-3'>Already have an account?</span>
						<Link className='font-medium no-underline ml-2 text-blue-500 cursor-pointer' to='/login'>
							Log in
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

						<label htmlFor='confirmPass' className='block text-900 font-medium mb-2'>
							Confirm Password
						</label>
						<InputText
							id='confirmPass'
							type='password'
							placeholder='Confirm Password'
							className='w-full mb-3'
							value={confirmPass}
							onChange={e => setConfirmPass(e.target.value)}
							disabled={isLoading}
						/>

						<Button
							type='submit'
							className='w-full mt-4'
							label={isLoading ? 'Registering...' : 'Register'}
							icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user'}
							disabled={isLoading}
						/>
					</form>
				</div>
			</div>
		</>
	);
}

export default Register;
