import ccsConfig from 'ccs-lint';
import globals from 'globals';
import viteConfig from './vite.config.js';


export default [
    ...ccsConfig(viteConfig),

    // Custom override to add Node.js globals
    {
        files: ['server/**/*.{ts,js}', 'shared/**/*.{ts,js}'],
        languageOptions: {
            globals: {
                ...globals.node,
                NodeJS: 'readonly',
            },
        },
    },
];
