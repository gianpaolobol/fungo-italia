import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const filenames = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

await mkdir(resolve(projectRoot, "public"), { recursive: true });
await Promise.all(filenames.map((filename) => copyFile(
  resolve(projectRoot, "node_modules/maplibre-gl/dist", filename),
  resolve(projectRoot, "public", filename),
)));
