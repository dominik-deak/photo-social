import { useEffect } from 'react';

/**
 * Custom hook to set the document title shown in the browser tab.
 */
export function useDocumentTitle(title: string) {
	useEffect(() => {
		document.title = title;
	}, [title]);
}
