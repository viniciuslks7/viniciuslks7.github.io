import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
const html = await readFile("index.html", "utf8");
const css = await readFile("css/style.css", "utf8");
const js = await readFile("js/main.js", "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "HTML IDs must be unique");
for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
  assert(ids.includes(id), `Missing section #${id}`);
for (const [, path] of html.matchAll(
  /(?:src|href)="((?:assets|css|js)\/[^"?#]+)"/g,
))
  await stat(path);
for (const [, href] of html.matchAll(/href="(https:[^"]+)"/g))
  assert.equal(new URL(href).protocol, "https:");
for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))
  assert(
    match[0].includes("noopener noreferrer"),
    "External links must isolate window.opener",
  );
assert(!html.includes("<form"), "Contact must use actual email links");
assert(
  !html.includes("assets/resume.pdf"),
  "Old resume must not be publicly linked",
);
assert(
  !/cdn\.|unpkg|fonts\.googleapis|cdnjs/.test(html),
  "No runtime third-party dependencies",
);
assert(css.includes("prefers-reduced-motion"), "Respect OS motion preference");
assert(
  js.includes("navigator.clipboard.writeText"),
  "Real clipboard implementation required",
);
console.log(
  "Static checks passed: unique IDs, anchor targets, local files, HTTPS links, external-link safety, real contact, motion support, no runtime CDNs.",
);
