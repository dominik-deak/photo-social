import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';

/**
 * Display a loading modal
 */
function LoadingModal() {
	return (
		<Dialog
			modal
			visible={true}
			onHide={() => null}
			content={() => (
				<div className='flex bg-primary p-5 border-round-3xl'>
					<ProgressSpinner />
					<span className='text-3xl my-auto ml-5'>Loading...</span>
				</div>
			)}
		/>
	);
}

export default LoadingModal;
