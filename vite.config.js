
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@client': path.resolve('./client'),
            '@server': path.resolve('./server'),
            '@shared': path.resolve('./shared'),
        },
    },
    server: {
        watch: {
            ignored: [
                '**/board-data/**',
            ],
        },
    },
});
