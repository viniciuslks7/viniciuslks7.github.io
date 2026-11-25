import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const esc = (value) => String(value).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
);
const external = 'target="_blank" rel="noopener noreferrer"';
const labels = {
  completion: ["Badge de conclusão", "Completion badge"],
  learning: ["Badge de treinamento", "Training badge"],
  student: ["Credencial de estudante", "Student credential"],
  participation: ["Badge de participação", "Participation badge"],
  recognition: ["Reconhecimento profissional", "Professional recognition"],
  issuer: ["Credencial do emissor", "Issuer credential"],
};
const bilingual = (pt, en, tag = "span", attrs = "") =>
  `<${tag}${attrs} data-badge-pt="${esc(pt)}" data-badge-en="${esc(en)}">${esc(pt)}</${tag}>`;
const typeLabel = (badge) => labels[badge.type] || ["Credencial", "Credential"];
const statusMarkup = (badge) => badge.inactive
  ? bilingual(badge.inactiveSince ? `Inativa desde ${badge.inactiveSince}` : "Inativa",
      badge.inactiveSince ? `Inactive since ${badge.inactiveSince}` : "Inactive",
      "span", ' class="badge-inactive"') : "";

export function badgeOrder(catalog) {
  if (!Array.isArray(catalog) || !catalog.length)
    throw new Error("The badge catalog needs at least one record");
  const ids = new Set();
  for (const badge of catalog) {
    if (typeof badge.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(badge.id) || ids.has(badge.id))
      throw new Error(`Invalid or duplicate badge ID: ${badge.id}`);
    ids.add(badge.id);
    const fields = ["title", "issuer", "pt", "en", "criteriaPt", "criteriaEn"];
    if (fields.some((key) => typeof badge[key] !== "string" || !badge[key].trim()) ||
        !/^[\w-]+\.(png|webp|jpe?g|svg)$/i.test(badge.image))
      throw new Error(`Incomplete badge: ${badge.id}`);
    for (const url of [badge.url, ...(badge.courseUrl ? [badge.courseUrl] : [])]) {
      if (new URL(url).protocol !== "https:")
        throw new Error(`Expected HTTPS for ${badge.id}`);
    }
    if (badge.issued != null && badge.issued !== "") {
      const date = new Date(badge.issued + "T00:00:00Z");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(badge.issued) || Number.isNaN(date.valueOf()) ||
          date.toISOString().slice(0, 10) !== badge.issued)
        throw new Error(`Invalid issue date for ${badge.id}: ${badge.issued}`);
    }
  }
  // Equal issue dates (and all undated records) are ordered by stable badge ID.
  return [...catalog].sort((a, b) =>
    (b.issued || "").localeCompare(a.issued || "") || a.id.localeCompare(b.id, "en"),
  );
}

function dateMarkup(badge) {
  if (!badge.issued)
    return bilingual("Emissão sem data confirmada", "Issue date unconfirmed");
  const format = (lang) => new Intl.DateTimeFormat(lang, {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(badge.issued + "T00:00:00Z"));
  return bilingual(format("pt-BR"), format("en-US"), "time", ` datetime="${badge.issued}"`);
}

function links(badge) {
  const verify = `<a class="text-button badge-verify" href="${esc(badge.url)}" ${external}>${bilingual("Verificar badge", "Verify badge")}<span aria-hidden="true">↗</span></a>`;
  const course = badge.courseUrl
    ? `<a class="text-button" href="${esc(badge.courseUrl)}" ${external}>${bilingual("Ver programa do curso", "View the course syllabus")}<span aria-hidden="true">↗</span></a>` : "";
  return verify + course;
}

function feature(badge) {
  if (!badge) return "";
  const kind = typeLabel(badge);
  return `<article class="course-spotlight" id="${badge.id}" aria-labelledby="latest-badge-title">
  <a class="course-art" href="${esc(badge.url)}" ${external}><img src="assets/badges/${badge.image}" width="220" height="150" loading="lazy" alt="${esc(badge.title)}" /></a>
  <div>${bilingual("Badge mais recente", "Latest badge", "p", ' class="small-label"')}<h3 id="latest-badge-title">${esc(badge.title)}</h3><p class="course-issuer">${esc(badge.issuer)}</p>${bilingual(...kind, "p", ' class="badge-feature-type"')}${dateMarkup(badge)}${statusMarkup(badge)}</div>
  <div class="course-description">${bilingual(badge.pt, badge.en, "p")}<div class="course-links">${links(badge)}</div></div>
</article>`;
}

function historyCard(badge) {
  const kind = typeLabel(badge);
  return `<article class="badge-card badge-history-card" id="${badge.id}" data-credential-category="${esc(badge.category)}">
  <a class="badge-art-link" data-badge-open="${badge.id}" href="${esc(badge.url)}" ${external} aria-label="${esc(badge.title)}"><img src="assets/badges/${badge.image}" alt="" width="90" height="90" loading="lazy" /></a>
  <div><p class="badge-history-meta">${dateMarkup(badge)} · ${esc(badge.issuer)}</p><h4>${esc(badge.title)}</h4>${bilingual(...kind, "span", ' class="credential-type"')}${statusMarkup(badge)}
  ${bilingual(badge.pt, badge.en, "p")}<div class="course-links">${links(badge)}</div></div>
</article>`;
}

function history(previous) {
  if (!previous.length)
    return `<p id="badge-history" class="badge-history-empty">${bilingual("Nenhuma badge anterior.", "No earlier badges.")}<span id="credential-count" class="sr-only" aria-live="polite"></span></p>`;
  const count = previous.length;
  const total = bilingual(
    count === 1 ? "1 badge anterior" : `${count} badges anteriores`,
    count === 1 ? "1 earlier badge" : `${count} earlier badges`,
  );
  const first = previous[0];
  const newest = first.issued ? bilingual(
    `A mais recente no histórico é ${first.title}`,
    `The latest in this history is ${first.title}`, "span", ' class="badge-history-last"',
  ) : "";
  const groups = [
    [previous.filter(b => b.issued), null],
    [previous.filter(b => !b.issued), ["Sem data de emissão confirmada", "Unconfirmed issue dates"]],
  ];
  const buttons = [
    ["all", "Todas", "All"], ["security", "Redes e segurança", "Networks and security"],
    ["cloud", "Cloud", "Cloud"], ["education", "Educação", "Education"], ["history", "Históricas", "Historical"],
  ];
  return `<details class="badge-history" id="badge-history"><summary>${bilingual("Histórico de badges", "Badge history", "strong")}<span class="badge-history-preview">${total}${newest}</span></summary>
<div id="credentials-grid"><div class="credential-filters" role="group" aria-label="Filtrar credenciais" data-i18n-aria="credentialFilterLabel">
${buttons.map(([id, pt, en]) => bilingual(pt, en, "button", ` type="button" data-credential-filter="${id}" aria-pressed="${id === "all"}"${id === "all" ? ' class="active"' : ""}`)).join("\n")}
<span id="credential-count" aria-live="polite">${previous.length}</span></div>
${groups.filter(([badges]) => badges.length).map(([badges, heading]) =>
    `<div class="badge-history-group">${heading ? bilingual(...heading, "h4") : ""}${badges.map(historyCard).join("\n")}</div>`).join("\n")}
</div></details>`;
}

function slot(badge) {
  return `<a data-badge-slot="${badge.id}" href="${esc(badge.url)}" ${external} aria-label="${esc(badge.title)}" title="${esc(badge.title)}">
  <span class="archive-pocket"><img data-slot-art src="assets/badges/${badge.image}" width="44" height="44" loading="lazy" alt="" /><i class="pocket-lip" aria-hidden="true"></i><i class="pocket-impact" aria-hidden="true"></i></span>
  <span>${esc(badge.shortTitle || badge.title)}</span>
</a>`;
}

export function renderBadgePage(template, catalog) {
  const ordered = badgeOrder(catalog);
  const latest = ordered[0].issued ? ordered[0] : null;
  const previous = ordered.filter(b => b !== latest);
  const slots = [...catalog].sort((a, b) => (a.slot ?? Infinity) - (b.slot ?? Infinity));
  const data = JSON.stringify(catalog.map((badge) => ({ ...badge, typeLabel: typeLabel(badge) }))).replaceAll("<", "\\u003c");
  const regions = {
    hero: latest ? `<a href="#${latest.id}">${bilingual("Badge mais recente", "Latest badge")}<strong>${esc(latest.title)}</strong></a>`
      : `<a href="#badge-history">${bilingual("Ver badges", "View badges")}</a>`,
    spotlight: feature(latest) + "\n" + history(previous),
    dock: bilingual(`Coleção · ${catalog.length} badges`, `Collection · ${catalog.length} badges`, "h3", ' class="small-label" id="badge-dock-title"') +
      `\n<div id="dragon-delivery-content" class="badge-dock-grid">\n${slots.map(slot).join("\n")}\n</div>`,
    missions: ordered.map((b, i) => `<option value="${b.id}"${i === 0 ? " selected" : ""}>${esc(b.title)}</option>`).join("\n"),
    data: `<script type="application/json" id="badge-catalog">${data}</script>`,
  };
  let html = template;
  for (const [key, content] of Object.entries(regions)) {
    const start = `<!-- badges:${key} -->`, end = `<!-- /badges:${key} -->`;
    const from = html.indexOf(start), to = html.indexOf(end);
    if (from < 0 || to < from) throw new Error(`Missing badge region: ${key}`);
    html = html.slice(0, from + start.length) + "\n" + content + "\n" + html.slice(to);
  }
  return html;
}

export async function readBadgePage(root, { sync = false } = {}) {
  const [template, catalog] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("assets/badges/catalog.json", root), "utf8"),
  ]);
  const html = renderBadgePage(template, JSON.parse(catalog));
  if (sync && html !== template) {
    const temp = new URL(`.badge-page-${randomUUID()}.tmp`, root);
    try {
      await writeFile(temp, html);
      await rename(temp, new URL("index.html", root));
    } finally {
      await rm(temp, { force: true });
    }
  }
  return html;
}
