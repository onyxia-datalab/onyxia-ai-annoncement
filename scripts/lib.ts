import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { build, context, type BuildOptions } from "esbuild";
import { zipSync } from "fflate";

export const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
export const staticResourcesDir = path.join(projectRoot, "custom-resources");

export async function emptyDir(dirPath: string) {
    await fs.rm(dirPath, { recursive: true, force: true });
    await fs.mkdir(dirPath, { recursive: true });
}

export async function copyStaticResources(outDir: string) {
    await fs.mkdir(outDir, { recursive: true });

    for (const entry of await fs.readdir(staticResourcesDir)) {
        const source = path.join(staticResourcesDir, entry);
        const destination = path.join(outDir, entry);

        await fs.rm(destination, { recursive: true, force: true });
        await fs.cp(source, destination, { recursive: true });
    }
}

export function getEsbuildOptions(params: {
    outDir: string;
    sourcemap: boolean;
}): BuildOptions {
    const { outDir, sourcemap } = params;

    return {
        entryPoints: [path.join(projectRoot, "src", "main.ts")],
        outfile: path.join(outDir, "js", "index.mjs"),
        bundle: true,
        format: "esm",
        platform: "browser",
        target: "es2020",
        sourcemap,
        jsx: "transform",
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
        tsconfigRaw: {
            compilerOptions: {
                jsx: "react",
                jsxFactory: "React.createElement",
                jsxFragmentFactory: "React.Fragment"
            }
        },
        logLevel: "info"
    };
}

export async function buildCustomResources(params: {
    outDir: string;
    sourcemap: boolean;
}) {
    const { outDir, sourcemap } = params;

    await emptyDir(outDir);
    await copyStaticResources(outDir);
    await build(getEsbuildOptions({ outDir, sourcemap }));
}

export async function createBuildContext(params: { outDir: string; sourcemap: boolean }) {
    return context(getEsbuildOptions(params));
}

export async function zipDirectory(params: { sourceDir: string; zipFilePath: string }) {
    const { sourceDir, zipFilePath } = params;
    const entries: Record<string, Uint8Array> = {};

    async function collect(dirPath: string) {
        for (const entry of await fs.readdir(dirPath, { withFileTypes: true })) {
            const filePath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                await collect(filePath);
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            const relativePath = path
                .relative(sourceDir, filePath)
                .split(path.sep)
                .join("/");

            entries[relativePath] = await fs.readFile(filePath);
        }
    }

    await collect(sourceDir);
    await fs.writeFile(zipFilePath, zipSync(entries, { level: 9 }));
}

export async function findOnyxiaWebDir(startDir: string): Promise<string> {
    let currentDir = path.resolve(startDir);

    for (;;) {
        const packageJsonPath = path.join(currentDir, "package.json");
        const pluginSystemPath = path.join(currentDir, "src", "pluginSystem");

        try {
            const packageJson = JSON.parse(
                await fs.readFile(packageJsonPath, "utf8")
            ) as { name?: string };
            const pluginSystemStat = await fs.stat(pluginSystemPath);

            if (packageJson.name === "onyxia-web" && pluginSystemStat.isDirectory()) {
                return currentDir;
            }
        } catch {
            // Continue walking upward.
        }

        const parentDir = path.dirname(currentDir);

        if (parentDir === currentDir) {
            throw new Error(`Could not find the Onyxia web directory from ${startDir}`);
        }

        currentDir = parentDir;
    }
}

export function assertNotSamePath(params: { projectRoot: string; targetDir: string }) {
    const projectRootResolved = path.resolve(params.projectRoot);
    const targetDirResolved = path.resolve(params.targetDir);

    if (projectRootResolved !== targetDirResolved) {
        return;
    }

    throw new Error(
        [
            "Refusing to run dev because this checkout is already located at the generated custom-resources output path.",
            "Clone this project as a sibling of Onyxia's public directory instead, for example:",
            "  web/onyxia-ai-announcement",
            "The dev script deletes web/public/custom-resources before rebuilding it."
        ].join("\n")
    );
}

export function spawnOnyxiaDev(webDir: string): ChildProcess {
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

    return spawn(npmCommand, ["run", "dev"], {
        cwd: webDir,
        stdio: "inherit"
    });
}
