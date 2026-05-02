import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { "core/index": "src/core/index.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],
    banner: { js: "#!/usr/bin/env node" },
    clean: false,
    sourcemap: true,
  },
]);
