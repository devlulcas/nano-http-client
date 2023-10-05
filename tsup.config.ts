import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
	entryPoints: ['src/index.ts', 'src/base-http-client.ts'],
	splitting: true,
	format: ['esm', 'cjs'],
	dts: true,
	clean: !opts.watch,
	sourcemap: true,
	minify: true,
	outDir: 'dist',
	target: 'es2020',
}));
