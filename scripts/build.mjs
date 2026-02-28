import { build } from "esbuild";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CORE_SRC = path.join(ROOT, "packages/core/src/index.ts");
const CORE_DIST = path.join(ROOT, "packages/core/dist");

const shared = {
  entryPoints: [CORE_SRC],
  bundle: true,
  platform: "node",
  target: "es2022",
  sourcemap: true,
  external: ["antlr4ng"],
  logLevel: "info",
};

async function main() {
  console.log("==> Bundling ESM...");
  await build({
    ...shared,
    format: "esm",
    outfile: path.join(CORE_DIST, "index.mjs"),
  });

  console.log("==> Bundling CJS...");
  await build({
    ...shared,
    format: "cjs",
    outfile: path.join(CORE_DIST, "index.cjs"),
  });

  console.log("==> Generating declarations...");
  execSync(
    "npx tsc --project packages/core/tsconfig.json --emitDeclarationOnly --declaration --outDir packages/core/dist",
    { cwd: ROOT, stdio: "inherit" },
  );

  console.log("==> Build complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
