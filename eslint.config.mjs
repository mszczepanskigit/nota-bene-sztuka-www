import eslintConfigPrettier from 'eslint-config-prettier';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

/** @type {import('typescript-eslint').ConfigArray} */
export default [
	// Global ignores
	{ ignores: ['dist/**', '.astro/**', 'node_modules/**'] },

	// Base JS rules
	js.configs.recommended,

	// TypeScript rules
	...tseslint.configs.recommended,

	// Astro rules (includes astro-eslint-parser for .astro files)
	...eslintPluginAstro.configs['flat/recommended'],

	// Prettier rules (disables conflicting formatting rules)
	eslintConfigPrettier,

	// Project-wide overrides
	{
		rules: {
			// Allow explicit `any` in edge cases — tighten as codebase matures
			'@typescript-eslint/no-explicit-any': 'warn',
			// Allow unused vars prefixed with `_`
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
	},
];
