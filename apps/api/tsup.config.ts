import { defineConfig } from "tsup";

// Production build: emits Node-runnable ESM at dist/index.js with all
// relative imports resolved and @pawconnect/shared (raw TS in the workspace)
// bundled in. Without this, plain-Node hosts crash with ERR_MODULE_NOT_FOUND
// — the dev server (tsx) tolerates extensionless TS imports, Node does not.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  sourcemap: true,
  // Bundle the workspace package; everything else (@prisma/client, express…)
  // stays external and loads from node_modules at runtime.
  noExternal: ["@pawconnect/shared"],
});
