import rootConfig from '../../eslint.config.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
    ...rootConfig,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: __dirname,
            },
        },
    },
    {
        ignores: ['.docusaurus/**', 'build/**', '**/*.tsx', '**/*.jsx'],
    },
];