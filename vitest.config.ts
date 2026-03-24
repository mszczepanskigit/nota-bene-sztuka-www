import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// Make test APIs available globally
		globals: true,
		// Run tests under src/lib/ (and any other *.test.ts files in src/)
		include: ['src/**/*.test.ts'],
		// Human-readable output
		reporters: ['verbose'],
	},
});
