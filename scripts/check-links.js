/**
 * Checks that every root-relative href/src in the built site points at a file
 * that exists, and that every #fragment points at an id on the target page.
 * Run after a build: `node scripts/check-links.js`.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const siteDir = "_site";

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function resolveTarget(urlPath) {
  const filePath = path.join(siteDir, decodeURI(urlPath));
  return urlPath.endsWith("/") ? path.join(filePath, "index.html") : filePath;
}

function idsIn(file) {
  const html = readFileSync(file, "utf8");
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
}

const errors = [];
let checked = 0;

for (const file of htmlFiles(siteDir)) {
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    checked++;
    const [urlPath, fragment] = url.split("#");
    const target = resolveTarget(urlPath);
    if (!existsSync(target)) {
      errors.push(`${file}: ${url} (missing ${target})`);
    } else if (fragment && !idsIn(target).has(fragment)) {
      errors.push(`${file}: ${url} (no id "${fragment}")`);
    }
  }
}

if (errors.length > 0) {
  console.error(`${errors.length} broken link(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`All ${checked} internal links OK.`);
