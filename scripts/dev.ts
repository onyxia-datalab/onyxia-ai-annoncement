import * as fs from "node:fs/promises";
import * as path from "node:path";
import chokidar from "chokidar";
import {
    assertNotSamePath,
    copyStaticResources,
    createBuildContext,
    emptyDir,
    findOnyxiaWebDir,
    projectRoot,
    spawnOnyxiaDev,
    staticResourcesDir
} from "./lib";

const webDir = await findOnyxiaWebDir(projectRoot);
const targetCustomResourcesDir = path.join(webDir, "public", "custom-resources");

assertNotSamePath({
    projectRoot,
    targetDir: targetCustomResourcesDir
});

await fs.copyFile(
    path.join(projectRoot, ".env.local.yaml"),
    path.join(webDir, ".env.local.yaml")
);

await emptyDir(targetCustomResourcesDir);
await copyStaticResources(targetCustomResourcesDir);

const esbuildContext = await createBuildContext({
    outDir: targetCustomResourcesDir,
    sourcemap: true
});

await esbuildContext.rebuild();
await esbuildContext.watch();

let staticCopyPromise = Promise.resolve();
const staticWatcher = chokidar.watch(staticResourcesDir, {
    ignoreInitial: true
});

staticWatcher.on("all", () => {
    staticCopyPromise = staticCopyPromise
        .then(() => copyStaticResources(targetCustomResourcesDir))
        .catch(error => {
            console.error(error);
        });
});

const onyxiaDevProcess = spawnOnyxiaDev(webDir);

const shutdown = async () => {
    await staticWatcher.close();
    await staticCopyPromise;
    await esbuildContext.dispose();

    if (onyxiaDevProcess.exitCode === null) {
        onyxiaDevProcess.kill();
    }
};

process.on("SIGINT", () => {
    shutdown().finally(() => process.exit(130));
});

process.on("SIGTERM", () => {
    shutdown().finally(() => process.exit(143));
});

onyxiaDevProcess.on("exit", code => {
    shutdown().finally(() => process.exit(code ?? 0));
});
