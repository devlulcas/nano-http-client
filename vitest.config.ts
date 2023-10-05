import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		coverage: {
			all: true,
			exclude: ['**/*.test.ts', '**/*.test.tsx'],
		},
	},
});
