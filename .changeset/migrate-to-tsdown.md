---
'@nodecord/core': patch
'@nodecord/djs-adapter': patch
---

## Internal

### Both packages are now built with tsdown instead of tsup

The public API is unchanged. Every export was compared against the published 0.2.0 tarballs, in ESM and CJS, for `@nodecord/core`, `@nodecord/djs-adapter` and `@nodecord/djs-adapter/testing`, and the surface is identical.

Two things do change in what ships:

Declaration maps (`.d.ts.map`) are now emitted, so jumping to a definition from an editor lands on the original source rather than the bundled declaration.

`@nodecord/djs-adapter` no longer duplicates the code shared between its two entry points, which is why its bundle is around 22% smaller. The shared code lives in an internal chunk that both entry points import. Nothing about `@nodecord/djs-adapter` or `@nodecord/djs-adapter/testing` changes for consumers, but anyone reaching into `dist/` directly, which was never supported, will find a different file layout.

The move also unblocks TypeScript 7. tsup generates declarations through `rollup-plugin-dts`, which depends on compiler APIs (`ts.sys`, `ts.createCompilerHost`) that the native TypeScript port no longer exposes, so the toolchain was pinned to TypeScript 6.
