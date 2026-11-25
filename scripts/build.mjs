import { mkdir, rm, cp, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { readBadgePage } from "./badge-page.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const html = await readBadgePage(new URL("../", import.meta.url), { sync: true });
const out = `${root}dist`;
await rm(out, { recursive: true, force: true });
await mkdir(`${out}/assets`, { recursive: true });
await writeFile(`${out}/index.html`, html);
for (const path of ["css", "js"])
  await cp(`${root}${path}`, `${out}/${path}`, { recursive: true });
// Only approved, public-facing assets ship. Historic documents and project media remain in git history.
for (const path of [
  "profile.jpg",
  "ink-valley.webp",
  "city.svg",
  "auxilium-illustration.svg",
  "favicon.svg",
  "social-cover.svg",
  "social-cover.png",
  "fonts",
  "badges",
  "cv/vinicius-oliveira-pt-br.pdf",
  "cv/vinicius-oliveira-en.pdf",
  "formation-records.json",
])
  await cp(`${root}assets/${path}`, `${out}/assets/${path}`, {
    recursive: true,
  });
await writeFile(`${out}/.nojekyll`, "");
await writeFile(
  `${out}/robots.txt`,
  "User-agent: *\nAllow: /\nSitemap: https://viniciuslks7.github.io/sitemap.xml\n",
);
await writeFile(
  `${out}/sitemap.xml`,
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://viniciuslks7.github.io/</loc></url></urlset>\n',
);
console.log(
  "Built dependency-free static site into dist/ (allowlisted assets only)",
);
