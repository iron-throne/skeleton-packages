import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@aryagg/theme': fileURLToPath(new URL('../theme/index.css', import.meta.url))
    }
  },
  plugins: [tailwindcss(), svelte()],
})
