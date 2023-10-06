import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
	entryPoints: ['src/index.ts', 'src/base.ts'],
	splitting: true,
	format: ['esm'],
	dts: true,
	clean: !opts.watch,
	sourcemap: true,
	minify: false,
	outDir: 'dist',
	target: 'es2022',
}));
