import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';


const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: DIRNAME, // Ensures relative paths inside client work correctly
    envDir: path.resolve(DIRNAME, '../'), // Loads .env from project root
    plugins: [vue()],
    build: {
        outDir: path.resolve(DIRNAME, 'dist'),
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@client': path.resolve(DIRNAME, 'src'),
            '@server': path.resolve(DIRNAME, '../server/src'),
            '@shared': path.resolve(DIRNAME, '../shared/src'),
        },
    },
});
