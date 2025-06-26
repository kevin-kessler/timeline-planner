import ccsConfig from 'ccs-lint';
import globals from 'globals';
import path from 'path';
import viteConfig from './client/vite.config.js';


export default [
    // Base config (from ccs-lint, based on airbnb)
    ...ccsConfig(viteConfig),

    // Client overrides (type-aware)
    {
        files: ['client/src/**/*.{ts,vue,js}'],
        languageOptions: {
            parserOptions: {
                project: './client/tsconfig.json',
                tsconfigRootDir: path.resolve(),
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            'import/extensions': ['error', 'ignorePackages', {
                ts: 'never',
                tsx: 'never',
            }],
        },
    },

    // Server + Shared  overrides
    {
        files: ['server/src/**/*.{ts,js}', 'shared/src/**/*.{ts,js}'],
        languageOptions: {
            parserOptions: {
                project: './server/tsconfig.json',
                tsconfigRootDir: path.resolve(),
            },
            globals: {
                ...globals.node,
                NodeJS: 'readonly',
            },
        },
        rules: {
            'import/extensions': ['error', 'ignorePackages', {
                ts: 'never',
                tsx: 'never',
            }],
        },
    },
];
