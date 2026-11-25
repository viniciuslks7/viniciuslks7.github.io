import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, extname, posix } from "node:path";
import { readBadgePage } from "./badge-page.mjs";
const root = resolve(".");
let html = await readBadgePage(new URL("../", import.meta.url));
const types = {
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};
const embedded = {};
async function dataURL(path) {
  if (embedded[path]) return embedded[path];
  const bytes = await readFile(resolve(root, path));
  const value = `data:${types[extname(path)] || "application/octet-stream"};base64,${bytes.toString("base64")}`;
  embedded[path] = value;
  return value;
}
for (const [link] of [...html.matchAll(/<link\b[^>]*>/gi)]) {
  if (!/\brel=["']stylesheet["']/i.test(link)) continue;
  const href = /\bhref=["'](css\/[^"']+)["']/i.exec(link)?.[1];
  if (!href) continue;
  let css = await readFile(resolve(root, href), "utf8");
  for (const [reference, relativePath] of [
    ...css.matchAll(/url\(["']?(\.\.?\/[^)"']+)["']?\)/g),
  ]) {
    const path = posix.join(posix.dirname(href), relativePath);
    const url = await dataURL(path);
    css = css.replaceAll(reference, () => `url("${url}")`);
  }
  const media = /\smedia=["'][^"']*["']/i.exec(link)?.[0] || "";
  html = html.replace(link, () => `<style${media}>${css}</style>`);
}
// The appearance script runs in the head so returning readers get their theme before paint.
const appearance = await readFile("js/appearance.js", "utf8");
html = html.replace('<script src="js/appearance.js"></script>', () => `<script>${appearance}</script>`);
html = html.replace(/<script defer src="js\/main.js"><\/script>/, "");
for (const match of [...html.matchAll(/(?:src|href)="(assets\/[^\"]+)"/g)])
  html = html.replaceAll(
    match[0],
    match[0].replace(match[1], await dataURL(match[1])),
  );
// Dynamic badge dialogs share the same embedded originals as the visible badge collection.
for (const filename of (await readdir("assets/badges")).filter((name) =>
  /\.(png|jpg|webp)$/i.test(name),
))
  await dataURL(`assets/badges/${filename}`);
const source = await readFile("js/main.js", "utf8");
html = html.replace(
  "</body>",
  () =>
    `<script>window.__VO_EMBEDDED_ASSETS__=${JSON.stringify(Object.fromEntries(Object.entries(embedded).filter(([path]) => path.startsWith("assets/badges/"))))};\n${source}</script></body>`,
);
const destination = resolve("../vinicius-portfolio-interactive-preview.html");
await writeFile(destination, html);
console.log(
  `Built self-contained interactive preview: ${destination} (${Buffer.byteLength(html)} bytes)`,
);
