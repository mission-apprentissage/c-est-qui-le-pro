import { createRequire } from "module";
import { dirname } from "path";
import { fileURLToPath } from "url";
export const require = createRequire(import.meta.url);

export function getDirname(base) {
  return dirname(fileURLToPath(base));
}
