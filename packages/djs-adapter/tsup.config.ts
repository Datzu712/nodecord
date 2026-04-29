import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'adapter/index.ts',
        'testing/index': 'testing/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    external: ['vitest'],
});
