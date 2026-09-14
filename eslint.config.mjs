import globals from 'globals'
import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
    {
        // The committed build artifact. Consumers resolve package.json's `main`
        // out of the checkout, so it lives in the repository -- but it is
        // generated, and linting it says nothing about this source.
        ignores: ['backend/www/**'],
    },
    js.configs.recommended,
    {
        // Both extensions on purpose. Under eslint 8 this was `eslint frontend/`
        // against an .eslintrc, which lints .js only: the five .jsx components
        // were silently unchecked for the life of the repo. They pass, but they
        // passed by not being looked at.
        files: ['frontend/**/*.{js,jsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            parser: babelParser,
            ecmaVersion: 2021,
            sourceType: 'module',
            parserOptions: {
                babelOptions: {
                    presets: ['@babel/preset-react'],
                },
                requireConfigFile: false,
            },
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/prop-types': 0,
            'react-hooks/rules-of-hooks': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            // eslint 9 flipped no-unused-vars' `caughtErrors` default from
            // 'none' to 'all', so `catch (_e)` began reporting. The third
            // pattern keeps the repo's existing `^_` convention answering for
            // all three positions rather than rewriting the source to suit it.
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            }],
        },
    },
]
