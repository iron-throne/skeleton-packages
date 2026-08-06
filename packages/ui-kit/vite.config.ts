import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
	resolve: {
		alias: {
			'@aryagg/theme': fileURLToPath(new URL('../theme/index.css', import.meta.url)),
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
			$atoms: fileURLToPath(new URL('./src/lib/atoms', import.meta.url)),
			$molecules: fileURLToPath(new URL('./src/lib/molecules', import.meta.url)),
			$organisms: fileURLToPath(new URL('./src/lib/organisms', import.meta.url))
		}
	},
	plugins: [
		tailwindcss(),
		svelte({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	]
});
