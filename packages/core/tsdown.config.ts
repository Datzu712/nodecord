import { defineConfig } from 'tsdown';

export default defineConfig((options) => ({
    entry: ['index.ts'],
    // tsdown defaults to ESM only, both formats have to be listed explicitly
    format: ['esm', 'cjs'],
    // Keep tsup's filenames: .js for ESM and .cjs for CJS, which is what the
    // exports in package.json point at. tsdown defaults this to true for the
    // node platform and would emit .mjs/.d.mts instead, leaving every declared
    // entrypoint pointing at a file that does not exist.
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    // watch mode must not wipe dist: parallel dev tasks (adapter DTS, bot restart) read it mid-rebuild
    clean: !options.watch,
    outDir: 'dist',
    external: ['vitest'],
}));
