#!/usr/bin/env node
// The production host's npm install silently fails to fetch sharp's Linux
// x64 binaries (@img/sharp-linux-x64 and, especially, the ~18MB
// @img/sharp-libvips-linux-x64 shared library) — the host disables manual
// `npm install` over SSH, so there's no reliable way to fix this at install
// time. Instead, the exact packages are vendored into this repo (see
// scripts/vendor/) and copied directly into the build output here, run as
// part of `npm run build`. That guarantees they're present in .output
// regardless of whether the host's own install step ever fetched them.
//
// Harmless everywhere else: on other platforms (e.g. local macOS dev) this
// just adds an unused extra platform package alongside the one actually in
// use — sharp picks the right one for the current OS/arch at runtime.
import { existsSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const vendorDir = path.join(__dirname, "vendor");
const targetDir = path.join(repoRoot, ".output/server/node_modules/@img");

const packages = ["sharp-linux-x64", "sharp-libvips-linux-x64"];

if (!existsSync(path.join(repoRoot, ".output/server"))) {
 console.warn(
  "[vendor-sharp-linux-binaries] .output/server not found — skipping (did the build fail?)",
 );
 process.exit(0);
}

for (const pkg of packages) {
 const src = path.join(vendorDir, pkg);
 const dest = path.join(targetDir, pkg);
 cpSync(src, dest, { recursive: true, force: true });
 console.log(`[vendor-sharp-linux-binaries] copied ${pkg} -> ${dest}`);
}
