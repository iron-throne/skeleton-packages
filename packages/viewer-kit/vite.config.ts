import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
	base: './',
	build: { outDir: 'demo-dist' },
	resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
	plugins: [
		tailwindcss(),
		svelte({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	]
});
