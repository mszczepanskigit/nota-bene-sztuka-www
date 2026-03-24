/** @type {import("prettier").Config} */
export default {
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: true,
	trailingComma: 'es5',
	printWidth: 100,
	plugins: ['prettier-plugin-astro'],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
};
