import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        // Exclude pdfjs-dist from Vite pre-bundling so it uses its own ESM output
        // This prevents version mismatches between the API bundle and worker
        exclude: ['pdfjs-dist'],
    },
    build: {
        rollupOptions: {
            // Ensure pdfjs-dist worker is bundled correctly in production
            output: {
                manualChunks(id) {
                    if (id.includes('pdfjs-dist')) {
                        return 'pdfjs';
                    }
                },
            },
        },
    },
})
