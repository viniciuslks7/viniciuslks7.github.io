import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
const port = Number(process.env.TEST_PORT) || 4181;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "pipe",
});
const report = {
  generatedAt: new Date().toISOString(),
  browser: "Chromium / Playwright",
  checks: [],
  accessibility: [],
  screenshots: [],
  notes: [
    "Touch coverage uses Chromium mobile/touch emulation, not a physical device.",
    "axe-core checks are automated evidence, not a complete manual accessibility certification.",
    "External issuer availability is not asserted; exact public source URLs are preserved.",
  ],
};
const pass = (name) => {
  report.checks.push({ name, status: "passed" });
  console.log(`PASS ${name}`);
};
let browser;
const checkNoOverflow = async (page, label) => {
  const size = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    size.scrollWidth <= size.width,
    `${label}: overflow ${JSON.stringify(size)}`,
  );
  pass(`${label}: no horizontal overflow`);
};
const audit = async (page, label) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  report.accessibility.push({
    label,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  assert.equal(
    result.violations.length,
    0,
    `${label}: axe violations ${JSON.stringify(report.accessibility.at(-1), null, 2)}`,
  );
  pass(`${label}: automated WCAG audit has zero violations`);
};
const screenshot = async (page, name, fullPage = false) => {
  await page.screenshot({
    path: `test-results/${name}.png`,
    fullPage,
    style:
      ".reading-progress,.skip-link,.chapter-dock,.toast{visibility:hidden!important}",
  });
  report.screenshots.push(`test-results/${name}.png`);
};
try {
  await mkdir("test-results", { recursive: true });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
    if (i === 49) throw new Error("Preview server did not start");
  }
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().startsWith(base) && r.status() >= 400)
      badResponses.push({ url: r.url(), status: r.status() });
  });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("html").getAttribute("lang"), "pt-BR");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  pass("PT-BR is the default language");
  await checkNoOverflow(page, "Desktop 1440");
  await audit(page, "Desktop PT");
  await screenshot(page, "desktop-home");
  await page
    .getByRole("button", { name: "Visão rápida", exact: true })
    .first()
    .click();
  assert(await page.locator("#quick-dialog").isVisible());
  assert(
    (await page.locator("#quick-dialog").innerText()).includes("Tecnólogo"),
  );
  pass("Recruiter quick view opens with accurate degree");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    assert(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest("#quick-dialog")),
      ),
    );
  }
  await page.keyboard.press("Shift+Tab");
  assert(
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest("#quick-dialog")),
    ),
  );
  pass("Native dialog traps forward and backward keyboard focus");
  await audit(page, "Recruiter dialog");
  await page.keyboard.press("Escape");
  assert(!(await page.locator("#quick-dialog").isVisible()));
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.matches('[data-open="quick"]'),
    ),
    true,
  );
  pass("Escape closes dialog and restores focus");
  await page.locator('[data-filter="backend"]').click();
  assert.equal(await page.locator(".project-card:visible").count(), 2);
  assert.equal(await page.locator("#project-count").innerText(), "02 PROJETOS");
  pass("Backend filter and accessible project count");
  await page.locator('[data-filter="fullstack"]').click();
  assert.equal(await page.locator(".project-card:visible").count(), 1);
  pass("Full-stack filter");
  await page.locator('[data-filter="all"]').click();
  assert.equal(await page.locator(".project-card:visible").count(), 3);
  pass("Filters reset correctly after repeated use");
  for (const id of ["keel", "starwars", "auxilium"]) {
    await page.locator(`[data-project-open="${id}"]`).click();
    assert(await page.locator("#project-dialog").isVisible());
    assert((await page.locator("#project-dialog").innerText()).length > 500);
    await audit(page, `Project dialog ${id}`);
    if (id === "keel") await screenshot(page, "project-keel");
    await page.locator("#project-dialog [data-close]").click();
    assert(!(await page.locator("#project-dialog").isVisible()));
  }
  pass("All project dossiers open, close, and expose actual details");
  await page.locator("#endpoint").selectOption("ledger");
  await page.locator("#run-request").click();
  await page.waitForFunction(
    () => !document.querySelector("#run-request").disabled,
  );
  const ledger = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(ledger.sumCents, 0);
  assert(ledger.balanced);
  pass("Local ledger example balances debit and credit");
  await page.locator("#endpoint").selectOption("retry");
  for (let i = 0; i < 2; i++) {
    await page.locator("#run-request").click();
    await page.waitForFunction(
      () => !document.querySelector("#run-request").disabled,
    );
  }
  const retry = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(retry.attempt, 2);
  assert(retry.replayed);
  assert.equal(retry.postedTransactions, 1);
  pass(
    "Idempotency example supports repeated requests without duplicate postings",
  );
  await page.locator("#run-request").click();
  await page.locator("#endpoint").selectOption("health");
  await page.waitForFunction(
    () => !document.querySelector("#run-request").disabled,
  );
  assert.equal(
    JSON.parse(await page.locator("#response-output").innerText()).status,
    "ok",
  );
  pass("Interrupted request recovers on endpoint change");
  await page.locator("#language").click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(
    await page.locator("#hero-title").innerText(),
    "CODE WITH\nPURPOSE.",
  );
  assert(
    (await page.locator("#credentials-grid").innerText())
      .toLowerCase()
      .includes("training badge"),
  );
  pass("English translation updates content and credentials accurately");
  await audit(page, "Desktop EN");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  pass("Language choice persists after reload");
  await page.locator("#language").click();
  await page.keyboard.press("Control+k");
  assert(await page.locator("#command-dialog").isVisible());
  await page.locator("#command-search").fill("projetos");
  assert.equal(await page.locator(".command-result").count(), 1);
  await page.locator("#command-search").press("Enter");
  assert(!(await page.locator("#command-dialog").isVisible()));
  assert.equal(new URL(page.url()).hash, "#projects");
  pass("Keyboard command palette searches and navigates");
  await page.keyboard.press("Control+k");
  await page.locator("#command-search").fill("inexistente");
  assert(
    (await page.locator("#command-results").innerText()).includes("Nenhum"),
  );
  await page.locator("#command-search").press("ArrowDown");
  await page.keyboard.press("Escape");
  await page.locator("#command-dialog").waitFor({ state: "hidden" });
  pass("Empty command search and keyboard dismissal recover correctly");
  await page.locator("#copy-email").click();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "vinicius.oliveiratwt@gmail.com",
  );
  assert((await page.locator("#toast").innerText()).includes("copiado"));
  pass("Copy email writes the actual address to clipboard");
  assert.equal(
    await page.locator(".email-row>a").getAttribute("href"),
    "mailto:vinicius.oliveiratwt@gmail.com",
  );
  assert.equal(await page.locator("form").count(), 0);
  pass("Contact uses a real mailto and no fake submission form");
  assert(
    await page.evaluate(() => document.body.classList.contains("motion-off")),
  );
  const moving = await page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .filter((e) => {
        const s = getComputedStyle(e);
        return s.animationName !== "none" && s.animationDuration !== "0s";
      })
      .map((e) => e.className),
  );
  assert.equal(moving.length, 0);
  pass("OS reduced-motion preference disables all animations");
  const educationText = await page.locator("#education-timeline").innerText();
  assert(
    educationText.includes("2017") &&
      educationText.includes("2019") &&
      educationText.includes("2022") &&
      educationText.includes("2023"),
  );
  assert(educationText.includes("ETEC") && educationText.includes("FATEC"));
  assert(!educationText.includes("SESI") && !educationText.includes("Ciplafe"));
  assert(!(await page.locator(".work-details").innerText()).includes("FATEC"));
  assert(
    !(await page.locator(".origin-panel").innerText()).includes(
      "CONCURSO DE STARTUPS",
    ),
  );
  assert(
    (await page.locator(".origin-panel").innerText()).includes("administração"),
  );
  pass(
    "Education and professional experience are separate; ETEC origin and 2022 Auxilium award are accurate",
  );
  await page.locator(".origin-extension summary").click();
  assert(
    (await page.locator(".origin-extension").innerText()).includes(
      "pasta térmica",
    ),
  );
  assert(
    !/\b20\d\d\b/.test(await page.locator(".origin-extension p").innerText()),
  );
  await page.locator(".origin-extension summary").click();
  pass(
    "Hardware volunteering is explained without invented dates or programmer/drone-role claims",
  );
  assert.equal(await page.locator(".broader-skills .skill-panel").count(), 6);
  const skills = await page.locator(".broader-skills").innerText();
  for (const technology of [
    "JavaScript",
    "React",
    "Java",
    "PHP",
    "C#",
    "ADVPL",
    "Python",
    "Node.js",
  ])
    assert(skills.includes(technology));
  assert(
    await page
      .locator(
        '.skill-proof[href="https://github.com/viniciuslks7/Springboot-CRUD"]',
      )
      .isVisible(),
  );
  pass(
    "Broader toolkit is readable and supported by public project links without proficiency percentages",
  );
  await page.locator(".auxilium-illustration").evaluate((img) => img.decode());
  assert(
    (
      await page.locator('[data-project="auxilium"] .project-copy').innerText()
    ).includes("protótipo"),
  );
  assert.equal(
    await page
      .locator(
        '[data-project="auxilium"] a[href="https://github.com/viniciuslks7/Aulas-de-React"]',
      )
      .count(),
    1,
  );
  pass(
    "Auxilium uses an original concept cover with authentic logo and an honest public-prototype source link",
  );
  await page.locator("#endpoint").selectOption("profile");
  let profile = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(profile.name, "Vinicius Oliveira");
  assert.equal(profile.mode, "developer");
  assert.equal(profile.runtime, "local-demo");
  for (const mission of ["paper", "piribull", "wakanda"]) {
    await page.locator("#sandbox-mission").selectOption(mission);
    profile = JSON.parse(await page.locator("#response-output").innerText());
    assert.equal(profile.fictionalMission, true);
    assert.equal(profile.name, "Vinicius Oliveira");
  }
  await page.locator("#endpoint").selectOption("opportunities");
  const topics = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(topics.contact.email, "vinicius.oliveiratwt@gmail.com");
  assert(!("availableHours" in topics) && !("availability" in topics));
  await page.locator("#endpoint").selectOption("ledger");
  const personalLedger = JSON.parse(
    await page.locator("#response-output").innerText(),
  );
  assert.equal(personalLedger.amountsAreFictional, true);
  assert.equal(personalLedger.balanced, true);
  await audit(page, "V6 personalized local lab");
  pass(
    "Personal profile/contact experiments and fictional missions do not imply real services, favourite anime, or availability",
  );
  // Richer professional information is available in-page, not only in modals.
  assert.equal(
    await page
      .locator('.hero-profile-links a[href="https://github.com/viniciuslks7"]')
      .count(),
    1,
  );
  assert.equal(await page.locator(".repository-row").count(), 3);
  assert(
    (await page.locator("#github").innerText()).includes("Analytics-Dashboard"),
  );
  assert.equal(await page.locator(".work-details details[open]").count(), 1);
  for (const id of ["keel", "starwars", "auxilium"]) {
    const detail = page.locator(`[data-project="${id}"] .inline-case`);
    await detail.locator("summary").click();
    assert(await detail.evaluate((node) => node.open));
    assert((await detail.locator("p").innerText()).length > 100);
    await detail.locator("summary").click();
    assert(!(await detail.evaluate((node) => node.open)));
  }
  pass(
    "Visible GitHub profile/repositories, detailed work context, and inline project disclosures",
  );
  await page.locator(".work-details details").nth(1).locator("summary").click();
  assert(
    (await page.locator(".work-details details").nth(1).innerText()).includes(
      "PostgreSQL",
    ),
  );
  pass("Past professional responsibilities expand in-page");
  for (let i = 0; i < 4; i++) {
    await page.locator(`[data-architecture="${i}"]`).click();
    assert.equal(
      await page
        .locator(`[data-architecture="${i}"]`)
        .getAttribute("aria-pressed"),
      "true",
    );
    assert((await page.locator("#architecture-code").innerText()).length > 80);
  }
  await page.locator('[data-architecture="1"]').press("ArrowRight");
  assert.equal(
    await page.locator('[data-architecture="2"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#trace-request").click();
  await page.waitForFunction(
    () => !document.querySelector("#trace-request").disabled,
  );
  assert.equal(
    await page.locator('[data-architecture="3"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#trace-request").click();
  await page.locator('[data-architecture="0"]').click();
  assert(await page.locator("#trace-request").isEnabled());
  pass(
    "Architecture explorer supports all layers, keyboard movement, tracing, repeated and interrupted flows",
  );
  await page.locator("#credentials").scrollIntoViewIfNeeded();
  for (const image of await page.locator(".badge-card img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (img) => {
      if (!img.complete)
        await new Promise((r) => {
          img.onload = r;
          img.onerror = r;
        });
    });
    assert((await image.evaluate((img) => img.naturalWidth)) > 0);
  }
  assert.equal(await page.locator(".badge-card").count(), 14);
  pass("All fourteen authentic badge images load and retain issuer links");
  await page.locator('[data-badge-open="aws-cloud-quest"]').first().click();
  assert(await page.locator("#badge-dialog").isVisible());
  assert(
    (await page.locator("#badge-dialog").innerText()).includes(
      "não a certificação",
    ),
  );
  await audit(page, "Cloud Quest badge dialog");
  await screenshot(page, "badge-cloud-quest");
  await page.keyboard.press("Escape");
  assert(await page.locator("#badge-dialog").isHidden());
  await page
    .locator('.oracle-badge-grid [data-badge-open="oracle-foundations"]')
    .click();
  assert((await page.locator("#badge-dialog").innerText()).includes("2023"));
  await page.locator("#badge-dialog [data-close]").click();
  pass(
    "AWS/Oracle badge dossiers, proper training/exam distinction, and keyboard dismissal",
  );
  assert.equal(await page.locator(".cisco-badge-grid .badge-card").count(), 6);
  assert.equal(
    await page.locator(".education-badge-grid .badge-card").count(),
    1,
  );
  await page.locator('[data-credential-filter="security"]').click();
  assert.equal(await page.locator(".badge-card:visible").count(), 6);
  await page.locator('[data-credential-filter="education"]').click();
  assert.equal(await page.locator(".badge-card:visible").count(), 1);
  await page.locator('[data-credential-filter="history"]').click();
  assert.equal(await page.locator(".badge-card:visible").count(), 3);
  assert(
    (await page.locator(".badge-inactive").innerText()).includes("15 JAN 2026"),
  );
  await page.locator('[data-credential-filter="all"]').click();
  assert.equal(await page.locator(".badge-card:visible").count(), 14);
  pass(
    "Expanded issuer-verified Cisco/Microsoft catalog, group filters, and explicit historical inactivity",
  );
  await page
    .locator('[data-badge-open="cisco-network-defense"]')
    .last()
    .click();
  assert(
    (await page.locator("#badge-dialog").innerText()).includes("2026-09-04"),
  );
  assert(
    (await page.locator("#badge-dialog").innerText()).includes("Firewalls"),
  );
  await audit(page, "Cisco record details");
  await page.keyboard.press("Escape");
  await page.locator('[data-badge-open="microsoft-mie-expert"]').last().click();
  assert(
    (await page.locator("#badge-dialog").innerText()).includes(
      "RECONHECIMENTO PROFISSIONAL",
    ),
  );
  await page.keyboard.press("Escape");
  pass(
    "Credential dossiers include issuer date, criterion, topics, and accurate recognition type",
  );
  assert.equal(await page.locator(".formation-record").count(), 58);
  assert.equal(await page.locator(".formation-record:visible").count(), 12);
  await page.locator("#formation-more").click();
  assert.equal(await page.locator(".formation-record:visible").count(), 58);
  await page.locator(".formation-record").first().locator("summary").click();
  assert(
    await page
      .locator(".formation-record")
      .first()
      .evaluate((el) => el.open),
  );
  await page.locator("#formation-search").fill("AWS");
  assert((await page.locator(".formation-record:visible").count()) > 5);
  await page.locator("#formation-search").fill("xyz-not-found");
  assert(await page.locator("#formation-empty").isVisible());
  await page.locator("#formation-search").fill("");
  await page.locator("#formation-type").selectOption("award");
  assert.equal(await page.locator(".formation-record:visible").count(), 1);
  await page.locator("#formation-type").selectOption("all");
  await page.locator("#formation-more").click();
  assert.equal(await page.locator(".formation-record:visible").count(), 12);
  pass(
    "All 58 sanitized formation records support progressive disclosure, search, type filters, and empty states",
  );
  assert.equal(await page.locator('a[href*="drive.google.com"]').count(), 0);
  assert.equal(
    await page
      .locator('a[href="https://blogs.oracle.com/academy/cps-5-hackathon"]')
      .count(),
    1,
  );
  pass(
    "No broad Drive/raw-PDF amplification; hackathon proof uses the authoritative public article",
  );

  await page.locator("#dragon-greet").click();
  assert(await page.locator("#dragon-speech").isVisible());
  assert(
    (await page.locator("#dragon-speech").innerText()).includes("credencial"),
  );
  await page.locator("#dragon-toggle").click();
  assert(await page.locator("[data-delivered-badge]").isVisible());
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  pass(
    "Dragon greeting works; reduced motion keeps the articulated creature and banner targets static",
  );
  const svgNodes = await page.locator(".paper-dragon *").count();
  assert(
    svgNodes < 300 && svgNodes > 200,
    `SVG source node budget: ${svgNodes}`,
  );
  assert.equal(await page.locator(".dragon-segment").count(), 7);
  assert.equal(
    await page
      .locator(".dragon-mane,.dragon-beard,.dragon-tail-tassel")
      .count(),
    3,
  );
  pass(
    "Detailed papercraft anatomy uses shared scale paint servers within a bounded SVG node budget",
  );
  await page.locator("#dragon-inspect").click();
  assert(await page.locator("#dragon-inspect-dialog").isVisible());
  await audit(page, "Dragon close-up PT");
  await screenshot(page, "v4-dragon-head");
  assert.equal(
    await page.locator("#dragon-art-viewport svg").getAttribute("viewBox"),
    "0 0 310 315",
  );
  assert.equal(await page.locator(".dragon-segment").count(), 7);
  assert(
    await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
      return new Set(ids).size === ids.length;
    }),
  );
  assert(
    await page
      .locator("#dragon-art-viewport svg")
      .evaluate((svg) =>
        [...svg.querySelectorAll("[fill]")]
          .filter((n) => n.getAttribute("fill").startsWith("url("))
          .every((n) =>
            document.getElementById(
              n.getAttribute("fill").match(/#([^)]*)/)[1],
            ),
          ),
      ),
  );
  pass(
    "Static close-up preserves unique IDs, valid scale references, and the original seven-segment motion skeleton",
  );
  for (const [view, box] of [
    ["body", "232 22 390 305"],
    ["tail", "930 4 310 235"],
    ["whole", "0 0 1240 340"],
  ]) {
    await page.locator(`[data-dragon-view="${view}"]`).click();
    assert.equal(
      await page.locator("#dragon-art-viewport svg").getAttribute("viewBox"),
      box,
    );
    assert.equal(
      await page
        .locator(`[data-dragon-view="${view}"]`)
        .getAttribute("aria-pressed"),
      "true",
    );
    await screenshot(page, `v4-dragon-${view}`);
  }
  pass(
    "Close-up controls inspect armor/claws, tail folds, and the whole illustration",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "dragon-inspect",
  );
  await page.locator("#dragon-inspect").click();
  await page.locator("#dragon-inspect-dialog [data-close]").click();
  pass(
    "Repeated illustration inspection, Escape, and close restore keyboard focus",
  );
  await page.locator("#home").scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) await page.locator("#secret-ink").click();
  assert(await page.locator("#bonus-dialog").isVisible());
  await audit(page, "Hidden bonus dialog");
  for (let i = 0; i < 3; i++)
    await page.locator(`[data-catch-bug="${i}"]`).click();
  assert.equal(
    await page.locator("#bug-count").innerText(),
    "3 / 3 CAPTURADOS",
  );
  assert(await page.locator("#hunt-complete").isVisible());
  await page.locator("#reset-bugs").click();
  assert.equal(
    await page.locator("#bug-count").innerText(),
    "0 / 3 CAPTURADOS",
  );
  await page.locator('[data-bonus="wakanda"]').click();
  assert(
    (await page.locator("#bonus-panel").innerText()).includes("vibranium"),
  );
  await page.locator('[data-bonus="piribull"]').click();
  assert((await page.locator("#bonus-panel").innerText()).includes("Perebull"));
  await page.keyboard.press("Escape");
  assert(await page.locator("#bonus-dialog").isHidden());
  pass(
    "Hidden margin interaction, bug hunt/restart, and owner-requested inside-joke panels",
  );
  await page.locator("body").press("w");
  await page.keyboard.type("akanda");
  assert(await page.locator("#bonus-dialog").isVisible());
  assert.equal(
    await page.locator('[data-bonus="wakanda"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.keyboard.press("Escape");
  await page.keyboard.type("perebull");
  assert(await page.locator("#bonus-dialog").isVisible());
  assert.equal(
    await page.locator('[data-bonus="piribull"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.keyboard.press("Escape");
  for (const key of [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ])
    await page.keyboard.press(key);
  assert(await page.locator("#bonus-dialog").isVisible());
  await page.keyboard.press("Escape");
  pass("Hidden WAKANDA/PEREBULL key sequences and classic keyboard Easter egg");
  await page.keyboard.press("Control+k");
  await page.locator("#command-search").fill("wakanda");
  assert(await page.locator("#bonus-dialog").isHidden());
  await page.keyboard.press("Escape");
  pass(
    "Typing inside search fields does not accidentally trigger hidden panels",
  );
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.locator("#chapter-next").click();
  assert.equal(new URL(page.url()).hash, "#story");
  await page.locator("#chapter-prev").click();
  assert.equal(new URL(page.url()).hash, "#home");
  await page.goBack();
  assert.equal(new URL(page.url()).hash, "#story");
  await page.goForward();
  assert.equal(new URL(page.url()).hash, "#home");
  pass(
    "Panel reader next/previous navigation preserves browser Back/Forward history",
  );
  await page.locator("#language").click();
  await page.locator('[data-architecture="2"]').click();
  assert(
    (await page.locator("#architecture-description").innerText()).includes(
      "integer",
    ),
  );
  await page.locator('[data-badge-open="aws-cloud-quest"]').first().click();
  assert(
    (await page.locator("#badge-dialog").innerText()).includes(
      "not the AWS Certified",
    ),
  );
  await page.keyboard.press("Escape");
  await page.locator("#home").scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) await page.locator("#secret-ink").click();
  assert(
    (await page.locator("#bonus-dialog").innerText()).includes(
      "SECRET CHAPTER",
    ),
  );
  await audit(page, "English hidden bonus");
  await page.keyboard.press("Escape");
  await page.locator("#dragon-inspect").click();
  assert(
    (await page.locator("#dragon-inspect-dialog").innerText()).includes(
      "FOLD BY FOLD",
    ),
  );
  await page.locator('[data-dragon-view="tail"]').click();
  assert(
    (await page.locator('[data-dragon-view="tail"]').innerText()).includes(
      "Tail & folds",
    ),
  );
  await audit(page, "Dragon close-up EN");
  await page.keyboard.press("Escape");
  pass(
    "Illustration inspector titles, views, and explanatory copy translate to English",
  );
  await page.locator("#language").click();
  pass(
    "New architecture, badge, dragon, and bonus content translates to English",
  );
  await page.waitForFunction(
    () => !document.querySelector("#toast").classList.contains("visible"),
  );
  await page.locator("#credentials").screenshot({
    path: "test-results/desktop-credentials.png",
    style:
      ".reading-progress,.skip-link,.chapter-dock,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/desktop-credentials.png");
  await page.locator(".dragon-scene").screenshot({
    path: "test-results/paper-dragon.png",
    style:
      ".reading-progress,.skip-link,.chapter-dock,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/paper-dragon.png");
  await page.locator("#github").screenshot({
    path: "test-results/desktop-github.png",
    style:
      ".reading-progress,.skip-link,.chapter-dock,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/desktop-github.png");
  await page.locator(".architecture-lab").screenshot({
    path: "test-results/architecture-lab.png",
    style:
      ".reading-progress,.skip-link,.chapter-dock,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/architecture-lab.png");

  await page.locator("#home").scrollIntoViewIfNeeded();
  await screenshot(page, "desktop-full", true);
  assert.equal(await page.locator(".aws-badge-grid .badge-verify").count(), 4);
  assert.equal(
    await page.locator(".oracle-badge-grid .badge-verify").count(),
    3,
  );
  pass("All four Credly and three Oracle issuer links are present");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  assert.equal(badResponses.length, 0, JSON.stringify(badResponses));
  pass("Desktop has no JavaScript errors or broken local network resources");
  await context.close();
  for (const width of [320, 360, 390, 600, 768, 1024]) {
    const c = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const p = await c.newPage();
    await p.goto(base);
    await p.evaluate(() => document.fonts.ready);
    await checkNoOverflow(p, `Viewport ${width}`);
    if (width === 390) {
      await audit(p, "Mobile PT");
      await screenshot(p, "mobile-home");
      await screenshot(p, "mobile-full", true);
      await p.locator("#language").click();
      await checkNoOverflow(p, "Mobile EN");
      await audit(p, "Mobile EN");
      await screenshot(p, "mobile-english");
    }
    await c.close();
  }
  const touchContext = await browser.newContext({
    ...devices["iPhone 13"],
    reducedMotion: "reduce",
  });
  const touch = await touchContext.newPage();
  await touch.goto(base);
  await touch.locator("#menu-toggle").tap();
  assert.equal(
    await touch.locator("#menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await touch.locator('#mobile-nav a[href="#projects"]').tap();
  assert(await touch.locator("#mobile-nav").isHidden());
  assert.equal(new URL(touch.url()).hash, "#projects");
  pass("Emulated mobile touch menu opens, navigates, and closes");
  await touch.locator('[data-filter="fullstack"]').tap();
  assert.equal(await touch.locator(".project-card:visible").count(), 1);
  await touch.locator('[data-project-open="auxilium"]').tap();
  assert(await touch.locator("#project-dialog").isVisible());
  await touch.locator("#project-dialog [data-close]").tap();
  pass("Emulated touch project filter and dossier controls");
  const client = await touchContext.newCDPSession(touch);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 190, y: 660 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 190, y: 300 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await checkNoOverflow(touch, "After emulated touch swipe");
  pass(
    "Emulated vertical touch gesture does not introduce horizontal overflow",
  );
  await touch.locator("#credentials").scrollIntoViewIfNeeded();
  await touch.locator("#dragon-greet").tap();
  assert(await touch.locator("#dragon-speech").isVisible());
  await touch.locator(".dragon-badge-banner").first().tap();
  assert(await touch.locator("#badge-dialog").isVisible());
  await touch.locator("#badge-dialog [data-close]").tap();
  await checkNoOverflow(touch, "Mobile paper dragon");
  await touch.waitForFunction(
    () => document.querySelector("#dragon-speech").hidden,
  );
  await touch.locator(".dragon-scene").screenshot({
    path: "test-results/mobile-dragon.png",
    style:
      ".reading-progress,.skip-link,.chapter-dock,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/mobile-dragon.png");
  await touch.locator("#dragon-inspect").tap();
  assert(await touch.locator("#dragon-inspect-dialog").isVisible());
  await checkNoOverflow(touch, "Mobile illustration inspector");
  await audit(touch, "Mobile dragon close-up");
  await screenshot(touch, "v4-dragon-mobile-head");
  await touch.locator('[data-dragon-view="body"]').tap();
  assert.equal(
    await touch.locator("#dragon-art-viewport").getAttribute("data-view"),
    "body",
  );
  assert.equal(
    await touch
      .locator("#dragon-art-viewport")
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
    0,
  );
  await touch.locator("#dragon-inspect-dialog [data-close]").tap();
  pass(
    "Touch inspection exposes static readable anatomy and respects reduced motion without overflow",
  );
  await touch.locator("#home").scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) await touch.locator("#secret-ink").tap();
  assert(await touch.locator("#bonus-dialog").isVisible());
  await touch.locator('[data-bonus="piribull"]').tap();
  await touch.locator("#bonus-dialog [data-close]").tap();
  pass("Emulated touch dragon, stable badge banner, and hidden margin panels");
  await touch.locator("#credentials").scrollIntoViewIfNeeded();
  await touch.locator("#dragon-full-motion").check();
  const touchStart = await touch
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  await touch.waitForFunction(
    (x) =>
      document.querySelector("#dragon-caravan").getBoundingClientRect().x - x >
      35,
    touchStart,
  );
  await touch.locator("#dragon-toggle").tap();
  await touch.locator("#dragon-full-motion").uncheck();
  assert.equal(
    await touch.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  await touch.locator("#dragon-mission").selectOption("cisco-cybersecurity");
  await touch.locator("#dragon-start").tap();
  assert(
    await touch
      .locator('[data-delivered-badge="cisco-cybersecurity"]')
      .isVisible(),
  );
  pass(
    "Mobile actual travel can be explicitly demonstrated, paused, and returned to reduced motion",
  );
  await touchContext.close();
  const motionContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(base);
  await motionPage.locator("#motion").click();
  assert(
    await motionPage.evaluate(() =>
      document.body.classList.contains("motion-off"),
    ),
  );
  await motionPage.reload();
  assert(
    await motionPage.evaluate(() =>
      document.body.classList.contains("motion-off"),
    ),
  );
  await motionPage.locator("#motion").click();
  assert(
    !(await motionPage.evaluate(() =>
      document.body.classList.contains("motion-off"),
    )),
  );
  pass("Manual motion toggle works and persists after reload");
  await motionPage.locator("#credentials").scrollIntoViewIfNeeded();
  await motionPage
    .locator("#dragon-mission")
    .selectOption("cisco-network-defense");
  await motionPage.locator("#dragon-start").click();
  const attach = async () =>
    motionPage.evaluate(() => {
      const anchors = [
        [330, 129],
        [484, 148],
        [624, 117],
        [721, 112],
        [824, 119],
        [919, 100],
        [990, 94],
      ];
      return [...document.querySelectorAll(".cargo-hinge")].map((hinge) => {
        const i = Number(hinge.dataset.cargoSegment),
          segment = document.querySelector(`[data-segment="${i}"]`),
          point = new DOMPoint(...anchors[i]).matrixTransform(
            segment.getScreenCTM(),
          ),
          a = hinge.querySelector(".cargo-anchor").getBoundingClientRect();
        return { id: i, dx: a.x - point.x, dy: a.y - point.y };
      });
    });
  const start = await motionPage
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  const attachedBefore = await attach();
  const maneBefore = await motionPage
    .locator(".dragon-mane")
    .evaluate((el) => getComputedStyle(el).transform);
  const limbBefore = await motionPage
    .locator(".dragon-limb")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  await motionPage.locator(".dragon-scene").screenshot({
    path: "test-results/v3-motion-early.png",
    style:
      ".chapter-dock,.reading-progress,.skip-link,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/v3-motion-early.png");
  await motionPage.evaluate(() => {
    window.__motionLongTasks = [];
    window.__motionObserver = new PerformanceObserver((list) =>
      window.__motionLongTasks.push(
        ...list.getEntries().map((e) => e.duration),
      ),
    );
    window.__motionObserver.observe({ type: "longtask", buffered: false });
  });
  await motionPage.waitForFunction(
    (x) =>
      document.querySelector("#dragon-caravan").getBoundingClientRect().x - x >
      60,
    start,
  );
  await motionPage.evaluate(() => window.__motionObserver.disconnect());
  const attachedAfter = await attach();
  for (let i = 0; i < 4; i++)
    assert(
      Math.abs(attachedAfter[i].dy - attachedBefore[i].dy) < 2.5,
      JSON.stringify({ before: attachedBefore, after: attachedAfter }),
    );
  const moved = await motionPage
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  assert(moved - start > 60);
  const limbAfter = await motionPage
    .locator(".dragon-limb")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  assert.notEqual(limbBefore, limbAfter);
  const maneAfter = await motionPage
    .locator(".dragon-mane")
    .evaluate((el) => getComputedStyle(el).transform);
  assert.notEqual(maneBefore, maneAfter);
  pass(
    "Mane, beard, and tail tassel participate in the coordinated flying-wave timeline",
  );
  assert(await motionPage.locator("#dragon-cargo").evaluate((el) => el.inert));
  pass(
    "Dragon flies more than 60 px with a phased head-to-tail wave and four physically attached banners",
  );
  await motionPage.locator(".dragon-scene").screenshot({
    path: "test-results/v3-motion-walking.png",
    style:
      ".chapter-dock,.reading-progress,.skip-link,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/v3-motion-walking.png");
  await motionPage.locator("#dragon-inspect").click();
  await motionPage.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
      .every((a) => a.playState === "paused" && !a.pending),
  );
  const inspectedX = await motionPage
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  await motionPage.waitForTimeout(160);
  assert(
    Math.abs(
      (await motionPage
        .locator("#dragon-caravan")
        .evaluate((el) => el.getBoundingClientRect().x)) - inspectedX,
    ) < 0.5,
  );
  await motionPage.keyboard.press("Escape");
  await motionPage.waitForFunction(() =>
    document
      .getAnimations()
      .some(
        (a) =>
          a.effect?.target?.closest?.("#dragon-caravan") &&
          a.playState === "running",
      ),
  );
  pass(
    "Close-up pauses every carried/mane animation and resumes the same journey after dismissal",
  );
  await motionPage.locator("#dragon-toggle").click();
  await motionPage.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
      .every((a) => a.playState === "paused" && !a.pending),
  );
  const pausedX = await motionPage
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  await motionPage.waitForTimeout(180);
  const afterPauseX = await motionPage
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  assert(
    Math.abs(afterPauseX - pausedX) < 0.5,
    JSON.stringify({ pausedX, afterPauseX }),
  );
  assert.equal(
    await motionPage.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (a) =>
              a.playState === "running" &&
              a.effect?.target?.closest?.("#dragon-caravan"),
          ).length,
    ),
    0,
  );
  pass(
    "Pause freezes caravan, body segments, limbs, and cargo at the current physical position",
  );
  await motionPage.locator("#dragon-scrub").focus();
  await motionPage.locator("#dragon-scrub").press("Home");
  for (let i = 0; i < 64; i++)
    await motionPage.locator("#dragon-scrub").press("ArrowRight");
  assert.equal(await motionPage.locator("#dragon-progress").innerText(), "64%");
  const flightTransform = await motionPage
    .locator(".dragon-flight-card")
    .evaluate((el) => el.style.transform);
  assert(/translate\([1-9]/.test(flightTransform), flightTransform);
  pass(
    "Selected hanging badge detaches and visibly travels toward the delivery dock",
  );
  await motionPage.locator(".dragon-scene").screenshot({
    path: "test-results/v3-motion-handoff.png",
    style:
      ".chapter-dock,.reading-progress,.skip-link,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/v3-motion-handoff.png");
  pass("Keyboard scrubbing shows the actual late-stage badge handoff");
  await motionPage.locator("#dragon-scrub").press("End");
  assert(
    await motionPage
      .locator('[data-delivered-badge="cisco-network-defense"]')
      .isVisible(),
  );
  assert.equal(
    await motionPage
      .locator(".cargo-hinge")
      .first()
      .evaluate((el) => getComputedStyle(el).visibility),
    "hidden",
  );
  await motionPage
    .locator('[data-delivered-badge="cisco-network-defense"]')
    .click();
  assert(
    (await motionPage.locator("#badge-dialog").innerText()).includes(
      "2026-09-04",
    ),
  );
  await motionPage.keyboard.press("Escape");
  await audit(motionPage, "V3 delivered credential scene");
  pass(
    "Selected badge leaves the caravan and becomes a stable, accessible detailed delivery",
  );
  await motionPage
    .locator("#dragon-mission")
    .selectOption("microsoft-mie-expert");
  await motionPage.locator("#dragon-start").click();
  await motionPage.locator("#dragon-toggle").click();
  await motionPage.locator("#dragon-scrub").focus();
  await motionPage.locator("#dragon-scrub").press("End");
  assert(
    await motionPage
      .locator('[data-delivered-badge="microsoft-mie-expert"]')
      .isVisible(),
  );
  await motionPage.locator(".dragon-scene").screenshot({
    path: "test-results/v3-motion-delivered.png",
    style:
      ".chapter-dock,.reading-progress,.skip-link,.toast{visibility:hidden!important}",
  });
  report.screenshots.push("test-results/v3-motion-delivered.png");
  pass(
    "Changing missions fetches and delivers a different verified credential",
  );
  await motionPage.locator("#dragon-start").click();
  await motionPage.locator("#dragon-reset").click();
  assert(
    Number(
      (await motionPage.locator("#dragon-progress").innerText()).replace(
        "%",
        "",
      ),
    ) < 3,
  );
  assert((await motionPage.locator("[data-delivered-badge]").count()) === 0);
  await motionPage.locator("#dragon-start").click();
  await motionPage.locator("#motion").click();
  assert.equal(
    await motionPage.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  pass(
    "Repeated starts, restart, and global animation pause recover consistently",
  );
  const tasks = await motionPage.evaluate(() => window.__motionLongTasks);
  report.performance = {
    motionLongTasks: tasks,
    maxLongTask: Math.max(0, ...tasks),
    sample:
      "Isolated active flying-wave interval, excluding screenshot and axe injection",
  };
  assert(Math.max(0, ...tasks) < 250, JSON.stringify(tasks));
  pass("Sampled motion interaction has no main-thread task exceeding 250 ms");

  await motionContext.close();
  const noJSContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const noJS = await noJSContext.newPage();
  await noJS.goto(base);
  assert(await noJS.locator("#hero-title").isVisible());
  assert.equal(await noJS.locator(".aws-badge-grid .badge-verify").count(), 4);
  assert.equal(
    await noJS.locator(".email-row>a").getAttribute("href"),
    "mailto:vinicius.oliveiratwt@gmail.com",
  );
  await checkNoOverflow(noJS, "Without JavaScript");
  pass(
    "Core chapters, credentials, and contact remain available without JavaScript",
  );
  await noJSContext.close();
  try {
    await stat("dist/assets/resume.pdf");
    throw new Error("Private/historic resume was included in deploy");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  pass("Deploy allowlist excludes historic resume and private files");
  report.status = "passed";
  console.log(
    `\n${report.checks.length} checks passed. ${report.accessibility.length} axe audits passed.`,
  );
} catch (error) {
  report.status = "failed";
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await writeFile("test-results/report.json", JSON.stringify(report, null, 2));
  if (browser) await browser.close();
  server.kill();
}
