import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.js',
            name: 'WebAPIs',
            formats: ['iife'],
            fileName: () => 'index.js'
        },
        outDir: 'AppHtml/Custom',
        emptyOutDir: true,
        sourcemap: true
    }
});
