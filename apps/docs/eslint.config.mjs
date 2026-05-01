import rootConfig from '../../eslint.config.mjs';
import eslintPrettier from 'eslint-plugin-prettier';
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
        ignores: ['.docusaurus/**', 'build/**'],
    },
    {
        files: ['**/*.{tsx,jsx}'],
        plugins: {
            prettier: eslintPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
        },
    },
];