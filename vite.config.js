import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        hmr: {
            protocol: 'ws',
            host: 'localhost',
        },
    },
    optimizeDeps: {
        // Exclude pdfjs-dist from Vite pre-bundling so it uses its own ESM output.
        // This prevents version mismatches between the API bundle and the worker file.
        exclude: ['pdfjs-dist'],
    },
    build: {
        rollupOptions: {
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
