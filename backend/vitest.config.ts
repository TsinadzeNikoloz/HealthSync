import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./tests/setup.ts'],
		testTimeout: 30000,
		exclude: ['dist/**', 'node_modules/**'],
		env: {
			NODE_ENV: 'development',
		},
	},
});
