import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  throw new Error("Missing Next.js command.");
}

const projectRoot = process.cwd();
const nextBin = resolve(projectRoot, "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, command, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
