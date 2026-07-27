import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: {
        index: 'adapter/index.ts',
        'testing/index': 'testing/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    // watch mode must not wipe dist: parallel dev tasks (bot restart) read it mid-rebuild
    clean: !options.watch,
    outDir: 'dist',
    external: ['vitest'],
}));
