/**
 * Creates a new book from the template below.
 * Usage: npm run new -- <yyyymmdd> "<Book Title>" <fiction|nonfiction> [audiobook]
 */
import { existsSync, writeFileSync } from "node:fs";

const [finished, title, category, format] = process.argv.slice(2);

if (
  !/^\d{8}$/.test(finished ?? "") ||
  !title ||
  !["fiction", "nonfiction"].includes(category) ||
  (format !== undefined && format !== "audiobook")
) {
  console.error(
    'Usage: npm run new -- <yyyymmdd> "<Book Title>" <fiction|nonfiction> [audiobook]',
  );
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const file = `content/books/${finished}-${slug}.md`;

if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}

const date = `${finished.slice(0, 4)}-${finished.slice(4, 6)}-${finished.slice(6)}`;

writeFileSync(
  file,
  `---
title: "${title.replace(/"/g, '\\"')}"
author: ""
date: '${date}'
completed: true
audiobook: ${format === "audiobook"}
category: "${category}"
pages:
id:
rating:
review:
---
`,
);
console.log(`Created ${file}`);
