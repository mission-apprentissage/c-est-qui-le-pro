import { defineConfig } from "tsup";

const isDev = process.env.TSUP_DEV === "true";

export default defineConfig({
  target: "es2020",
  platform: "node",
  format: ["esm"],
  splitting: false,
  shims: true,
  minify: false,
  sourcemap: true,
  noExternal: [
    "geotoolbox",
    /*"shared"*/
  ],
  clean: true,
  publicDir: false,
  watch: isDev ? ["src" /*, "../shared"*/] : false,
  ignoreWatch: ["public/**/*"],
  entryPoints: ["src/index.ts"],
  onSuccess: isDev ? "yarn run start --inspect" : undefined,
});
