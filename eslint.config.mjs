import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin'
import html from 'eslint-plugin-html';
import json from '@eslint/json';
import js from '@eslint/js';

export default defineConfig([
    globalIgnores(['dev/data/']),
    // Lint JavaScript files
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],

        extends: ['js/recommended'],

        plugins: {
            '@stylistic': stylistic,
            js,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },
        },

        rules: {
            '@stylistic/indent': [
                'error', 4, {
                    SwitchCase: 1,
                }
            ],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
        },
    },
    // Lint HTML files
    {
        files: ['**/*.html'],

        plugins: {
            html,
        },

        settings: {
            'html/report-bad-indent': 'error',
        },
    },
    // Lint JSON files
    {
        files: ['**/*.json'],

        plugins: {
            json,
        },

        extends: ['json/recommended'],

        language: 'json/json',
		rules: {
			'json/no-duplicate-keys': 'error',
		},
    },
]);