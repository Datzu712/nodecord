import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';
import eslintPrettier from 'eslint-plugin-prettier';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintConfigPrettier,
    {
        files: ['**/*.ts'],
        plugins: {
            prettier: eslintPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-arrow-callback': 'error',
        },
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.base.json'],
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            // Type safety
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',

            // Async/await
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/promise-function-async': 'warn',

            // Code quality
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            'no-console': ['error', { allow: ['warn', 'error'] }],

            // Random disabled rules
            '@typescript-eslint/no-magic-numbers': 'off',
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/class-methods-use-this': 'off',
            '@typescript-eslint/prefer-destructuring': 'off',
            'no-console': 'off',
        },
    },
    {
        ignores: [
            '**/dist',
            '**/*.mjs',
            'prisma.config.ts',
            'jest.config.js',
            'dist/**',
            '**/out-tsc',
            '**/generated',
            '**/gen',
            '**/__tests__/**',
            '**/?(*.)+(spec|test).[jt]s?(x)',
            'old/**',
        ],
    },
];
