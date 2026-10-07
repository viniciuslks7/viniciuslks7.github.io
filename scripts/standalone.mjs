import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve(".");
let html = await readFile("index.html", "utf8");
let css =
  (await readFile("css/fonts.css", "utf8")) +
  "\n" +
  (await readFile("css/style.css", "utf8"));
const types = {
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
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
for (const match of [
  ...css.matchAll(/url\(["']?(\.\.\/assets\/[^)"']+)["']?\)/g),
]) {
  const path = match[1].replace(/^\.\.\//, "");
  css = css.replaceAll(match[0], `url("${await dataURL(path)}")`);
}
html = html
  .replace(/<link\s+rel="stylesheet"\s+href="css\/[^\"]+"\s*\/?>/g, "")
  .replace(/<script defer src="js\/main.js"><\/script>/, "");
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
html = html
  .replace("</head>", () => `<style>${css}</style></head>`)
  .replace(
    "</body>",
    () =>
      `<script>window.__VO_EMBEDDED_ASSETS__=${JSON.stringify(Object.fromEntries(Object.entries(embedded).filter(([path]) => path.startsWith("assets/badges/"))))};\n${source}</script></body>`,
  );
const destination = resolve("../vinicius-portfolio-interactive-preview.html");
await writeFile(destination, html);
console.log(
  `Built self-contained interactive preview: ${destination} (${Buffer.byteLength(html)} bytes)`,
);
