import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { badgeOrder, renderBadgePage } from "./badge-page.mjs";

const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
const catalog = JSON.parse(await readFile(new URL("../assets/badges/catalog.json", import.meta.url), "utf8"));
const example = catalog.find((badge) => badge.id === "claude-101");
const fixture = (id, issued) => ({
  ...example, id, issued, slot: undefined, title: id, url: `https://example.org/${id}`,
});
const baseline = [{ ...example, issued: "2026-10-28" }, fixture("historical", "2019-02-01")];
const region = (html, name) => html.split(`<!-- badges:${name} -->`)[1].split(`<!-- /badges:${name} -->`)[0];
const archive = (html) => [...region(html, "spotlight").matchAll(/class="badge-card badge-history-card" id="([^"]+)"/g)].map((m) => m[1]);

test("latest badge, link, archive, mission and pocket follow the same catalog", () => {
  const newer = fixture("next-badge", "2026-11-11");
  const html = renderBadgePage(template, [...baseline, newer]);
  assert.match(region(html, "hero"), /href="#next-badge"/);
  assert.match(region(html, "spotlight"), /class="course-spotlight" id="next-badge"/);
  assert.equal(archive(html)[0], example.id);
  assert.equal(archive(html).length, baseline.length);
  assert.equal(html.match(/\bid="claude-101"/g).length, 1);
  assert.match(region(html, "missions"), /value="next-badge" selected/);
  assert.match(region(html, "dock"), /data-badge-slot="next-badge"/);
  const pocketIds = (page) => [...region(page, "dock").matchAll(/data-badge-slot="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(pocketIds(html).slice(0, -1), pocketIds(renderBadgePage(template, baseline)));
  assert.match(region(html, "data"), /"id":"next-badge"/);
  assert.equal(html.includes(example.courseUrl), true);
  assert.equal(renderBadgePage(html, [...baseline, newer]), html);
});

test("older records enter history without replacing the latest; equal issue dates use ID order", () => {
  const older = fixture("older", "2022-06-01");
  assert.match(region(renderBadgePage(template, [...baseline, older]), "hero"), /href="#claude-101"/);
  const sameDay = fixture("a-tie", example.issued);
  const source = [example, sameDay, older];
  for (const records of [source, [...source].reverse()]) {
    const html = renderBadgePage(template, records);
    assert.match(region(html, "hero"), /href="#a-tie"/);
    assert.deepEqual(archive(html), [example.id, older.id]);
  }
});

test("records without an issue date stay in undated history, including Oracle editions", () => {
  const undated = fixture("undated", undefined);
  const hist = catalog.filter((badge) => !badge.issued);
  assert(hist.some((badge) => badge.title.includes("2023")));
  const all = [undated, ...hist];
  const html = renderBadgePage(template, all);
  assert.match(region(html, "hero"), /href="#badge-history"/);
  assert.doesNotMatch(region(html, "spotlight"), /<time|class="course-spotlight"/);
  assert.deepEqual(archive(html), badgeOrder(all).map((badge) => badge.id));
  const mixed = renderBadgePage(template, [undated, example, fixture("older", "2018-01-01")]);
  assert.deepEqual(archive(mixed), ["older", "undated"]);
});

test("invalid dates, duplicate identifiers and unsupported verification URLs fail clearly", () => {
  for (const issued of ["2026-02-31", "2025", "n/a"])
    assert.throws(() => badgeOrder([fixture("bad", issued)]), /Invalid issue date/);
  assert.throws(() => badgeOrder([example, example]), /duplicate badge ID/);
  assert.throws(() => badgeOrder([{...example, url:"http://example.org"}]), /HTTPS/);
});

test("history summary describes its count and its newest confirmed record", () => {
  const empty = renderBadgePage(template, [example]);
  assert.match(region(empty, "spotlight"), /Nenhuma badge anterior\./);
  const single = renderBadgePage(template, [example, fixture("previous", "2020-02-01")]);
  assert.match(region(single, "spotlight"), /1 badge anterior/);
  assert.match(region(single, "spotlight"), /A mais recente no histórico é previous/);
  const undated = renderBadgePage(template, [example, fixture("undated", null)]);
  assert.doesNotMatch(region(undated, "spotlight"), /A mais recente no histórico/);
});

test("catalog text remains text in HTML, attributes and the inline JSON script", () => {
  const title = 'Badge </script> & "more"';
  const html = renderBadgePage(template, [{ ...example, title }]);
  assert(region(html, "hero").includes("&lt;/script&gt; &amp; &quot;more&quot;"));
  const raw = region(html, "data").trim().replace(/^<script[^>]*>|<\/script>$/g, "");
  assert.equal(JSON.parse(raw)[0].title, title);
  assert(!raw.includes("</script>"));
});
