import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { BASE } from './src/config';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: BASE
});
