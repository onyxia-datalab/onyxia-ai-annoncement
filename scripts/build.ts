import * as fs from "node:fs/promises";
import * as path from "node:path";
import { buildCustomResources, emptyDir, projectRoot, zipDirectory } from "./lib";

const buildRoot = path.join(projectRoot, ".build");
const zipSourceDir = path.join(buildRoot, "onyxia-ai-announcement");
const zipFilePath = path.join(projectRoot, "onyxia-ai-announcement.zip");

await emptyDir(zipSourceDir);
await buildCustomResources({
    outDir: zipSourceDir,
    sourcemap: false
});
await zipDirectory({
    sourceDir: zipSourceDir,
    zipFilePath
});
await fs.rm(buildRoot, { recursive: true, force: true });

console.log(`Created ${zipFilePath}`);
