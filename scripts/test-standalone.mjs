import { chromium, devices } from "playwright";
import assert from "node:assert/strict";
import { resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {}),
  args: ["--no-sandbox"],
});
const report = {
  status: "pending",
  checks: [],
  notes: [
    "Executed against the actual downloadable file:// HTML, not the development server.",
  ],
};
const pass = (name) => {
  report.checks.push(name);
  console.log("PASS " + name);
};
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(
    pathToFileURL(resolve("../vinicius-portfolio-interactive-preview.html"))
      .href,
  );
  await page.evaluate(() => document.fonts.ready);
  assert.equal(errors.length, 0, JSON.stringify(errors));
  assert(await page.locator("#hero-title").isVisible());
  assert.equal(await page.locator("html").getAttribute("lang"), "pt-BR");
  pass("Actual standalone file loads without JavaScript errors");
  await page.locator('[data-filter="backend"]').click();
  assert.equal(await page.locator(".project-card:visible").count(), 2);
  await page.locator('[data-project-open="keel"]').click();
  assert(await page.locator("#project-dialog").isVisible());
  await page.keyboard.press("Escape");
  pass("Project filtering and case-study dialog work offline");
  await page.locator('[data-badge-open="aws-cloud-quest"]').first().click();
  assert(await page.locator("#badge-dialog").isVisible());
  await page.locator("#badge-dialog img").evaluate((img) => img.decode());
  assert(
    (await page
      .locator("#badge-dialog img")
      .evaluate((img) => img.naturalWidth)) > 0,
  );
  assert(
    (await page.locator("#badge-dialog img").getAttribute("src")).startsWith(
      "data:image/png",
    ),
  );
  await page.keyboard.press("Escape");
  pass("Badge banners open dossiers with embedded original artwork");
  await page.locator('[data-architecture="2"]').click();
  assert(
    (await page.locator("#architecture-description").innerText()).includes(
      "inteiras",
    ),
  );
  await page.locator("#trace-request").click();
  await page.waitForFunction(
    () => !document.querySelector("#trace-request").disabled,
  );
  pass("Architecture inspection and request trace work offline");
  await page.locator("#language").click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  await page.locator('[data-badge-open="oracle-foundations"]').click();
  assert((await page.locator("#badge-dialog").innerText()).includes("2023"));
  await page.keyboard.press("Escape");
  pass("English and Oracle badge details work in the file preview");
  await page.keyboard.press("Control+k");
  await page.locator("#command-search").fill("GitHub");
  await page.locator("#command-search").press("Enter");
  assert.equal(new URL(page.url()).hash, "#github");
  pass("Command palette navigates real local file anchors");
  await page.locator("#home").scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) await page.locator("#secret-ink").click();
  assert(await page.locator("#bonus-dialog").isVisible());
  for (let i = 0; i < 3; i++)
    await page.locator(`[data-catch-bug="${i}"]`).click();
  assert(await page.locator("#hunt-complete").isVisible());
  await page.keyboard.press("Escape");
  pass("Hidden margin panel and local bug hunt work offline");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#menu-toggle").click();
  assert.equal(
    await page.locator("#menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await page.locator('#mobile-nav a[href="#credentials"]').click();
  assert(await page.locator("#mobile-nav").isHidden());
  await page.locator("#dragon-greet").click();
  assert(await page.locator("#dragon-speech").isVisible());
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  pass("Mobile navigation, paper dragon greeting, and layout work offline");
  assert.equal(
    await page.locator(".email-row>a").getAttribute("href"),
    "mailto:vinicius.oliveiratwt@gmail.com",
  );
  assert.equal(errors.length, 0, JSON.stringify(errors));
  assert(
    requests.every((url) => url.startsWith("file:") || url.startsWith("data:")),
    JSON.stringify(requests),
  );
  pass("Email destination is correct and all runtime assets are embedded");
  assert.equal(await page.locator(".formation-record").count(), 58);
  await page.locator("#formation-search").fill("Cisco");
  assert((await page.locator(".formation-record:visible").count()) > 0);
  await page.locator("#formation-search").fill("");
  await page.locator("#dragon-mission").selectOption("microsoft-mie-expert");
  await page.locator("#dragon-start").click();
  assert(
    await page
      .locator('[data-delivered-badge="microsoft-mie-expert"]')
      .isVisible(),
  );
  await page.locator('[data-delivered-badge="microsoft-mie-expert"]').click();
  await page.locator("#badge-dialog img").evaluate((img) => img.decode());
  assert(
    (await page.locator("#badge-dialog img").getAttribute("src")).startsWith(
      "data:image/png",
    ),
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator('a[href*="drive.google.com"]').count(), 0);
  pass(
    "V3 formation catalog and new delivered badge artwork remain fully embedded and private-source-safe",
  );
  await page.locator("#dragon-inspect").click();
  assert(await page.locator("#dragon-inspect-dialog").isVisible());
  assert.equal(
    await page.locator("#dragon-art-viewport svg").getAttribute("viewBox"),
    "0 0 310 315",
  );
  await page.locator('[data-dragon-view="tail"]').click();
  assert.equal(
    await page.locator("#dragon-art-viewport svg").getAttribute("viewBox"),
    "930 4 310 235",
  );
  assert(
    await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
      return new Set(ids).size === ids.length;
    }),
  );
  await page.keyboard.press("Escape");
  pass(
    "Detailed dragon close-up and shared SVG paint servers work in the actual offline file",
  );
  await page.locator("#endpoint").selectOption("profile");
  let profile = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(profile.name, "Vinicius Oliveira");
  assert.equal(profile.mode, "developer");
  assert.equal(profile.runtime, "local-demo");
  await page.locator("#sandbox-mission").selectOption("piribull");
  profile = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(profile.fictionalMission, true);
  assert(profile.mission.includes("Perebull"));
  await page.locator("#endpoint").selectOption("opportunities");
  const topics = JSON.parse(await page.locator("#response-output").innerText());
  assert.equal(topics.contact.email, "vinicius.oliveiratwt@gmail.com");
  assert(!("availableHours" in topics));
  // The earlier backend filter hides Auxilium; reveal its lazy artwork before decode.
  await page.locator('[data-filter="all"]').click();
  await page.locator(".auxilium-illustration").scrollIntoViewIfNeeded();
  await page.locator(".auxilium-illustration").evaluate((img) => img.decode());
  assert(
    (
      await page.locator(".auxilium-illustration").getAttribute("src")
    ).startsWith("data:image/svg+xml"),
  );
  assert(
    (await page.locator("#education-timeline").innerText()).includes("ETEC"),
  );
  assert(!(await page.locator(".work-details").innerText()).includes("FATEC"));
  pass(
    "V6 personal fictional experiments, education/work separation, and authentic-logo concept cover work in the actual file",
  );
  await mkdir("test-results/v5-video", { recursive: true });
  const flightContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    recordVideo: {
      dir: "test-results/v5-video",
      size: { width: 1440, height: 1000 },
    },
  });
  const flight = await flightContext.newPage(),
    flightErrors = [];
  flight.on("pageerror", (e) => flightErrors.push(e.message));
  await flight.goto(
    pathToFileURL(resolve("../vinicius-portfolio-interactive-preview.html"))
      .href,
  );
  await flight.waitForTimeout(500);
  assert.equal(await flight.locator("#dragon-progress").innerText(), "0%");
  assert.equal(
    await flight.locator(".dragon-scene").getAttribute("data-dragon-state"),
    "ready",
  );
  assert.equal(
    await flight
      .locator("#dragon-caravan")
      .evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
    0,
  );
  pass(
    "Actual normal-motion file does not spend its flight while the dragon is offscreen",
  );
  await flight.evaluate(() => {
    const r = document.querySelector("#dragon-stage").getBoundingClientRect();
    scrollBy(0, r.top - innerHeight - 20);
  });
  await flight.waitForTimeout(300);
  assert.equal(await flight.locator("#dragon-progress").innerText(), "0%");
  pass("A visible scene header alone does not start the unseen dragon stage");
  await flight.locator("#dragon-stage").scrollIntoViewIfNeeded();
  await flight.waitForFunction(
    () =>
      document.querySelector(".dragon-scene").dataset.dragonState === "walking",
  );
  const matrices = () =>
    flight.locator(".dragon-segment").evaluateAll((nodes) =>
      nodes.map((n) => {
        const m = new DOMMatrix(getComputedStyle(n).transform);
        return { angle: Math.atan2(m.b, m.a), y: m.f };
      }),
    );
  const firstPose = await matrices();
  await flight.waitForTimeout(360);
  const secondPose = await matrices();
  assert(firstPose.some((p, i) => Math.abs(p.y - secondPose[i].y) > 4));
  assert(new Set(secondPose.map((p) => p.angle.toFixed(2))).size > 4);
  assert(
    secondPose.some((p, i) => Math.abs(p.angle - firstPose[i].angle) > 0.03),
  );
  pass(
    "Actual file autostarts visible flight with independent phased segment angles and positions",
  );
  const firstBadge = await flight
    .locator(".dragon-scene")
    .getAttribute("data-dragon-credential");
  const firstCycle = await flight
    .locator(".dragon-scene")
    .getAttribute("data-dragon-cycle");
  await flight.waitForTimeout(600);
  await flight
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-enter.png" });
  const cycleBeforeResize = await flight
    .locator(".dragon-scene")
    .getAttribute("data-dragon-cycle");
  const percentBeforeResize = Number(
    (await flight.locator("#dragon-progress").innerText()).replace("%", ""),
  );
  await flight.setViewportSize({ width: 1440, height: 940 });
  await flight.waitForTimeout(400);
  assert.equal(
    await flight.locator(".dragon-scene").getAttribute("data-dragon-cycle"),
    cycleBeforeResize,
  );
  assert(
    Number(
      (await flight.locator("#dragon-progress").innerText()).replace("%", ""),
    ) > percentBeforeResize,
  );
  pass(
    "Height-only browser viewport changes preserve and continue the same flight",
  );
  await flight.waitForFunction(
    () =>
      Number(
        document.querySelector("#dragon-progress").value.replace("%", ""),
      ) >= 30,
  );
  await flight
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-wave.png" });
  await flight.waitForFunction(
    () =>
      document.querySelector(".dragon-flight-card")?.dataset.flightProgress >
      0.35,
  );
  await flight
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-toss.png" });
  await flight.waitForFunction(
    (id) =>
      document.querySelector("#dragon-stage").dataset.landedCredential === id,
    firstBadge,
  );
  assert(
    await flight.locator(`[data-delivered-badge="${firstBadge}"]`).isVisible(),
  );
  const firstLanding = JSON.parse(
    await flight
      .locator("#dragon-stage")
      .getAttribute("data-landing-continuity"),
  );
  assert(
    Math.abs(firstLanding.dx) < 2 &&
      Math.abs(firstLanding.dy) < 2 &&
      Math.abs(firstLanding.dw) < 2,
    JSON.stringify(firstLanding),
  );
  pass(
    "Natural toss lands continuously into the fixed accessible credential image slot",
  );
  await flight.waitForFunction(
    () =>
      Number(
        document.querySelector("#dragon-progress").value.replace("%", ""),
      ) >= 85,
  );
  await flight
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-exit.png" });
  await flight.waitForFunction(
    (c) =>
      Number(document.querySelector(".dragon-scene").dataset.dragonCycle) >
      Number(c),
    firstCycle,
  );
  const secondBadge = await flight
    .locator(".dragon-scene")
    .getAttribute("data-dragon-credential");
  assert.notEqual(secondBadge, firstBadge);
  assert(
    await flight.locator(`[data-delivered-badge="${firstBadge}"]`).isVisible(),
  );
  await flight.waitForFunction(
    () =>
      Number(
        document.querySelector("#dragon-progress").value.replace("%", ""),
      ) >= 12,
  );
  await flight
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-next.png" });
  await flight.waitForFunction(
    (id) =>
      document.querySelector("#dragon-stage").dataset.landedCredential === id,
    secondBadge,
  );
  assert(
    await flight.locator(`[data-delivered-badge="${secondBadge}"]`).isVisible(),
  );
  await flight
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-second-delivery.png" });
  pass(
    "Two real-time cycles deliver different credentials while retaining the previous readable dock until replacement",
  );
  await flight.locator("#dragon-loop").uncheck();
  await flight.waitForFunction(
    () =>
      document.querySelector(".dragon-scene").dataset.dragonState ===
      "delivered",
  );
  const stoppedCycle = await flight
    .locator(".dragon-scene")
    .getAttribute("data-dragon-cycle");
  await flight.waitForTimeout(300);
  assert.equal(
    await flight.locator(".dragon-scene").getAttribute("data-dragon-cycle"),
    stoppedCycle,
  );
  await flight.locator("#dragon-loop").check();
  await flight.waitForFunction(
    () =>
      document.querySelector(".dragon-scene").dataset.dragonState === "walking",
  );
  assert.notEqual(
    await flight
      .locator(".dragon-scene")
      .getAttribute("data-dragon-credential"),
    secondBadge,
  );
  pass(
    "Loop controls finish one cycle cleanly, then resume with a different next credential",
  );
  await flight.locator("#dragon-delivery").hover();
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
      .every((a) => a.playState === "paused" && !a.pending),
  );
  await flight.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const hoverX = await flight
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  await flight.waitForTimeout(200);
  assert(
    Math.abs(
      (await flight
        .locator("#dragon-caravan")
        .evaluate((el) => el.getBoundingClientRect().x)) - hoverX,
    ) < 0.5,
    JSON.stringify(
      await flight.evaluate(() => ({
        x: document.querySelector("#dragon-caravan").getBoundingClientRect().x,
        status: document.querySelector("#dragon-status").textContent,
        cycle: document.querySelector(".dragon-scene").dataset.dragonCycle,
        animations: document
          .getAnimations()
          .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
          .map((a) => ({
            state: a.playState,
            pending: a.pending,
            time: a.currentTime,
          })),
      })),
    ),
  );
  await flight.mouse.move(0, 0);
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .some(
        (a) =>
          a.effect?.target?.closest?.("#dragon-caravan") &&
          a.playState === "running",
      ),
  );
  pass(
    "Hovering the stable dock pauses flight for reading and leaving resumes it",
  );
  await flight.locator("[data-delivered-badge]").focus();
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
      .every((a) => a.playState === "paused" && !a.pending),
  );
  await flight.locator("#dragon-toggle").focus();
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .some(
        (a) =>
          a.effect?.target?.closest?.("#dragon-caravan") &&
          a.playState === "running",
      ),
  );
  pass(
    "Keyboard focus holds the delivered credential without a moving or replaced reading target",
  );
  await flight.locator("#home").scrollIntoViewIfNeeded();
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
      .every((a) => a.playState === "paused" && !a.pending),
  );
  const offscreenProgress = await flight
    .locator("#dragon-progress")
    .innerText();
  await flight.waitForTimeout(240);
  assert.equal(
    await flight.locator("#dragon-progress").innerText(),
    offscreenProgress,
  );
  await flight.locator("#dragon-stage").scrollIntoViewIfNeeded();
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .some(
        (a) =>
          a.effect?.target?.closest?.("#dragon-caravan") &&
          a.playState === "running",
      ),
  );
  pass(
    "Leaving and returning to the section pauses and resumes instead of permanently freezing",
  );
  const beforeWidthCycle = await flight
    .locator(".dragon-scene")
    .getAttribute("data-dragon-cycle");
  const beforeWidthProgress = Number(
    (await flight.locator("#dragon-progress").innerText()).replace("%", ""),
  );
  await flight.setViewportSize({ width: 1300, height: 940 });
  await flight.waitForTimeout(300);
  assert.equal(
    await flight.locator(".dragon-scene").getAttribute("data-dragon-cycle"),
    beforeWidthCycle,
  );
  assert(
    Number(
      (await flight.locator("#dragon-progress").innerText()).replace("%", ""),
    ) >= beforeWidthProgress,
  );
  pass(
    "A width-changing layout resize rebuilds geometry at the existing cycle progress without freezing",
  );
  await flight.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.("#dragon-caravan"))
      .every((a) => a.playState === "paused" && !a.pending),
  );
  await flight.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await flight.waitForFunction(() =>
    document
      .getAnimations()
      .some(
        (a) =>
          a.effect?.target?.closest?.("#dragon-caravan") &&
          a.playState === "running",
      ),
  );
  pass(
    "A simulated hidden-tab visibility signal pauses and recovers the shared flight clock",
  );
  await flight.locator("#dragon-toggle").click();
  await flight.locator("#dragon-scrub").evaluate((el) => {
    el.value = "55";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await flight.locator("#dragon-scrub").dispatchEvent("input");
  const origin = JSON.parse(
    await flight.locator("#dragon-stage").getAttribute("data-launch-origin"),
  );
  const launchRect = await flight
    .locator(".dragon-flight-card")
    .evaluate((el) => {
      const r = el.getBoundingClientRect(),
        s = document.querySelector("#dragon-stage").getBoundingClientRect();
      return { x: r.x - s.x, y: r.y - s.y, width: r.width };
    });
  assert(
    Math.abs(origin.x - launchRect.x) < 1.5 &&
      Math.abs(origin.y - launchRect.y) < 1.5 &&
      Math.abs(origin.width - launchRect.width) < 1.5,
    JSON.stringify({ origin, launchRect }),
  );
  await flight.locator("#dragon-scrub").evaluate((el) => {
    el.value = "64";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await flight.locator("#dragon-scrub").dispatchEvent("input");
  assert(
    Number(
      await flight
        .locator(".dragon-flight-card")
        .getAttribute("data-flight-progress"),
    ) > 0.5,
  );
  pass(
    "Scrubbed release starts at the carried banner's actual position and follows an independent toss arc",
  );
  assert.equal(flightErrors.length, 0, JSON.stringify(flightErrors));
  const video = flight.video();
  await flightContext.close();
  report.normalMotionVideo =
    "test-results/v5-video/" + basename(await video.path());
  const mobileContext = await browser.newContext({
    ...devices["iPhone 13"],
    reducedMotion: "no-preference",
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(
    pathToFileURL(resolve("../vinicius-portfolio-interactive-preview.html"))
      .href,
  );
  await mobile.locator("#dragon-stage").scrollIntoViewIfNeeded();
  await mobile.waitForFunction(
    () =>
      document.querySelector(".dragon-scene").dataset.dragonState === "walking",
  );
  const mobileX = await mobile
    .locator("#dragon-caravan")
    .evaluate((el) => el.getBoundingClientRect().x);
  await mobile.waitForTimeout(1100);
  assert(
    (await mobile
      .locator("#dragon-caravan")
      .evaluate((el) => el.getBoundingClientRect().x)) >
      mobileX + 20,
  );
  await mobile.waitForFunction(
    () =>
      Number(
        document.querySelector("#dragon-progress").value.replace("%", ""),
      ) >= 35,
  );
  await mobile
    .locator(".dragon-scene")
    .screenshot({ path: "test-results/v5-flight-mobile.png" });
  assert(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await mobile.setViewportSize({ width: 390, height: 780 });
  await mobile.waitForTimeout(350);
  assert.equal(
    await mobile.locator(".dragon-scene").getAttribute("data-dragon-state"),
    "walking",
  );
  await mobile.locator("#dragon-mission").selectOption("microsoft-mie-expert");
  await mobile.locator("#dragon-scrub").evaluate((el) => {
    el.value = "72";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await mobile.locator("#dragon-scrub").dispatchEvent("input");
  const mobileLanding = JSON.parse(
    await mobile
      .locator("#dragon-stage")
      .getAttribute("data-landing-continuity"),
  );
  assert(
    Math.abs(mobileLanding.dx) < 2 &&
      Math.abs(mobileLanding.dy) < 2 &&
      Math.abs(mobileLanding.dw) < 2,
    JSON.stringify(mobileLanding),
  );
  pass(
    "Actual mobile file autostarts visible flight, survives height changes, and lands a long-title credential without overflow",
  );
  await mobileContext.close();
  report.status = "passed";
  console.log(`${report.checks.length} standalone checks passed.`);
} catch (e) {
  report.status = "failed";
  report.failure = e.stack;
  process.exitCode = 1;
  console.error(e);
} finally {
  await writeFile(
    "test-results/standalone-report.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
