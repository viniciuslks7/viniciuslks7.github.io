import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  TRUSTED_CHECK,
  assertCheckout,
  assertCurrentMain,
  assertDeployment,
  createGitHubClient,
  evaluateChecks,
  listChecks,
  resolveTarget,
  waitForGitGuardian,
} from "./gitguardian-gate.mjs";

const head = "a".repeat(40);
const merge = "b".repeat(40);
const repository = "viniciuslks7/viniciuslks7.github.io";
const push = () => ({
  eventName: "push",
  sha: head,
  ref: "refs/heads/main",
  repository,
  event: {
    repository: { full_name: repository },
    ref: "refs/heads/main",
    after: head,
    deleted: false,
  },
});
const pr = () => ({
  ...push(),
  eventName: "pull_request",
  sha: merge,
  ref: "refs/pull/1/merge",
  event: {
    repository: { full_name: repository },
    pull_request: {
      head: { sha: head },
      base: { ref: "main", repo: { full_name: repository } },
    },
  },
});
const dispatch = (ref = "main") => ({
  ...push(),
  eventName: "workflow_dispatch",
  event: { repository: { full_name: repository }, ref },
});
const approved = (changes = {}) => ({
  id: 100,
  name: TRUSTED_CHECK.name,
  app: { id: TRUSTED_CHECK.appId, slug: TRUSTED_CHECK.appSlug },
  head_sha: head,
  status: "completed",
  conclusion: "success",
  completed_at: "2026-10-07T12:00:00Z",
  ...changes,
});
const page = (check_runs) => ({ total_count: check_runs.length, check_runs });

test("PR resolves actual head, not the synthetic merge SHA", () => {
  assert.equal(resolveTarget(pr()), head);
  assert.throws(
    () => assertCheckout(merge, resolveTarget(pr())),
    /Checkout differs/,
  );
});
test("main push and manual main dispatch resolve the event's exact commit", () => {
  assert.equal(resolveTarget(push()), head);
  assert.equal(resolveTarget(dispatch()), head);
  assert.equal(resolveTarget(dispatch("refs/heads/main")), head);
});

const badContexts = [
  ["feature branch push", () => ({ ...push(), ref: "refs/heads/feature" })],
  ["tag push", () => ({ ...push(), ref: "refs/tags/main" })],
  ["non-main dispatch", () => ({ ...dispatch(), ref: "refs/heads/feature" })],
  ["dispatch payload mismatch", () => dispatch("feature")],
  [
    "unsupported event",
    () => ({ ...push(), eventName: "pull_request_target" }),
  ],
  ["repository mismatch", () => ({ ...push(), repository: "other/repo" })],
  ["missing SHA", () => ({ ...push(), sha: undefined })],
  ["short SHA", () => ({ ...push(), sha: "abcdef" })],
  [
    "push SHA mismatch",
    () => {
      const c = push();
      c.event.after = merge;
      return c;
    },
  ],
  [
    "push ref mismatch",
    () => {
      const c = push();
      c.event.ref = "refs/heads/other";
      return c;
    },
  ],
  [
    "deleted branch",
    () => {
      const c = push();
      c.event.deleted = true;
      return c;
    },
  ],
  [
    "wrong PR base",
    () => {
      const c = pr();
      c.event.pull_request.base.ref = "other";
      return c;
    },
  ],
  [
    "wrong PR base repository",
    () => {
      const c = pr();
      c.event.pull_request.base.repo.full_name = "other/repo";
      return c;
    },
  ],
  [
    "invalid PR head",
    () => {
      const c = pr();
      c.event.pull_request.head.sha = merge.slice(0, 7);
      return c;
    },
  ],
];
for (const [name, context] of badContexts) {
  test(`rejects ${name}`, () => assert.throws(() => resolveTarget(context())));
}

test("only trusted app/name, completed success, exact SHA can approve", () => {
  assert.deepEqual(evaluateChecks([approved()], head), {
    state: "success",
    id: 100,
  });
});
for (const [name, runs] of [
  ["missing check", []],
  ["wrong app ID", [approved({ app: { id: 15368, slug: "gitguardian" } })]],
  [
    "wrong app slug",
    [approved({ app: { id: 46505, slug: "github-actions" } })],
  ],
  ["wrong name", [approved({ name: "GitGuardian scan" })]],
  ["queued check", [approved({ status: "queued", conclusion: null })]],
  [
    "in-progress check with success conclusion",
    [approved({ status: "in_progress" })],
  ],
]) {
  test(`${name} never approves`, () =>
    assert.equal(evaluateChecks(runs, head).state, "waiting"));
}
for (const conclusion of [
  "failure",
  "cancelled",
  "timed_out",
  "action_required",
  "neutral",
  "skipped",
  "stale",
  null,
]) {
  test(`completed ${conclusion} fails closed`, () => {
    assert.throws(
      () => evaluateChecks([approved({ conclusion })], head),
      /did not succeed/,
    );
  });
}
test("trusted check on synthetic or previous SHA fails closed", () => {
  assert.throws(
    () => evaluateChecks([approved({ head_sha: merge })], head),
    /wrong SHA/,
  );
});
test("malformed check response, identity and completion do not pass", () => {
  assert.throws(() => evaluateChecks({}, head), /Malformed/);
  assert.throws(
    () => evaluateChecks([approved({ id: "100" })], head),
    /check ID/,
  );
  assert.throws(
    () => evaluateChecks([approved({ completed_at: null })], head),
    /timestamp/,
  );
  assert.throws(
    () => evaluateChecks([approved({ status: "unknown" })], head),
    /status/,
  );
});
test("newer pending rerun supersedes old success regardless of response order", () => {
  const pending = approved({ id: 101, status: "queued", conclusion: null });
  assert.equal(evaluateChecks([pending, approved()], head).state, "waiting");
  assert.equal(evaluateChecks([approved(), pending], head).state, "waiting");
});
test("newer failure supersedes old success; newer success can resolve old failure", () => {
  assert.throws(() =>
    evaluateChecks(
      [approved(), approved({ id: 101, conclusion: "failure" })],
      head,
    ),
  );
  assert.equal(
    evaluateChecks(
      [approved({ id: 99, conclusion: "failure" }), approved()],
      head,
    ).state,
    "success",
  );
});

test("API client uses GET, fixed GitHub origin, no redirects and bounded requests", async () => {
  let call;
  const request = createGitHubClient(
    repository,
    "test-only-placeholder",
    async (url, options) => {
      call = { url, options };
      return { ok: true, json: async () => page([approved()]) };
    },
  );
  await request("/commits/" + head + "/check-runs", 1000);
  assert.equal(
    call.url,
    `https://api.github.com/repos/${repository}/commits/${head}/check-runs`,
  );
  assert.equal(call.options.method, "GET");
  assert.equal(call.options.redirect, "error");
  assert(call.options.signal instanceof AbortSignal);
  assert.equal(
    call.options.headers.Authorization,
    "Bearer test-only-placeholder",
  );
  await assert.rejects(() => request("https://other.invalid/"), /API path/);
});
test("missing token and HTTP permission failure fail closed without fallback", async () => {
  assert.throws(() => createGitHubClient(repository, ""), /GITHUB_TOKEN/);
  const request = createGitHubClient(
    repository,
    "test-only-placeholder",
    async () => ({ ok: false, status: 403 }),
  );
  await assert.rejects(() => request("/check-runs"), /HTTP 403/);
});
test("API pagination inspects every page, including a newer pending rerun", async () => {
  const first = Array.from({ length: 100 }, (_, i) => approved({ id: i + 1 }));
  const paths = [];
  const runs = await listChecks(async (path) => {
    paths.push(path);
    return {
      total_count: 101,
      check_runs:
        paths.length === 1 ? first : [approved({ id: 101, status: "queued" })],
    };
  }, head);
  assert.equal(paths.length, 2);
  assert(paths[0].includes(`/commits/${head}/check-runs?`));
  assert(
    paths.every(
      (path) =>
        path.includes("filter=all") &&
        path.includes("GitGuardian%20Security%20Checks"),
    ),
  );
  assert.equal(evaluateChecks(runs, head).state, "waiting");
});
for (const [name, response] of [
  ["truncated page", { total_count: 101, check_runs: [approved()] }],
  ["inconsistent count", { total_count: 0, check_runs: [approved()] }],
  ["excessive result count", { total_count: 1001, check_runs: [] }],
  [
    "duplicate results",
    { total_count: 2, check_runs: [approved(), approved()] },
  ],
  ["malformed page", { check_runs: [] }],
]) {
  test(`${name} fails closed`, async () => {
    await assert.rejects(() => listChecks(async () => response, head));
  });
}

function polling(request, timeoutMs = 30) {
  let clock = 0;
  return {
    request,
    targetSha: head,
    timeoutMs,
    intervalMs: 10,
    now: () => clock,
    pause: async (ms) => {
      clock += ms;
    },
    log: () => {},
  };
}
test("polls absent and pending check until trusted exact-SHA success", async () => {
  let calls = 0;
  const results = [
    page([]),
    page([approved({ status: "in_progress", conclusion: null })]),
    page([approved()]),
  ];
  const result = await waitForGitGuardian(
    polling(async () => results[calls++]),
  );
  assert.equal(result.state, "success");
  assert.equal(calls, 3);
});
for (const [name, response] of [
  ["missing", page([])],
  ["pending", page([approved({ status: "queued", conclusion: null })])],
  [
    "wrong app",
    page([approved({ app: { id: 15368, slug: "github-actions" } })]),
  ],
]) {
  test(`${name} check times out with publication blocked`, async () => {
    await assert.rejects(
      () => waitForGitGuardian(polling(async () => response)),
      /timed out/,
    );
  });
}
test("API failure and completed failure abort polling immediately", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      waitForGitGuardian(
        polling(async () => {
          calls++;
          throw new Error("API unavailable");
        }),
      ),
    /API unavailable/,
  );
  assert.equal(calls, 1);
  await assert.rejects(
    () =>
      waitForGitGuardian(
        polling(async () => page([approved({ conclusion: "failure" })])),
      ),
    /did not succeed/,
  );
});
test("late success after deadline cannot approve", async () => {
  let clock = 0;
  await assert.rejects(
    () =>
      waitForGitGuardian({
        ...polling(async () => {
          clock = 31;
          return page([approved()]);
        }),
        now: () => clock,
      }),
    /timed out/,
  );
});

test("deployment requires identical built, scanned, checked-out and event SHAs", () => {
  assert.equal(assertDeployment(push(), head, head, head), head);
  assert.equal(assertDeployment(dispatch(), head, head, head), head);
  assert.throws(() => assertDeployment(push(), merge, head, head), /Build SHA/);
  assert.throws(
    () => assertDeployment(push(), head, merge, head),
    /Security SHA/,
  );
  assert.throws(() => assertDeployment(push(), head, head, merge), /Checkout/);
  assert.throws(
    () => assertDeployment(pr(), head, head, head),
    /PR cannot deploy/,
  );
});
test("main advancement, incorrect ref or noncommit object prevents stale deploy", () => {
  const main = {
    ref: "refs/heads/main",
    object: { type: "commit", sha: head },
  };
  assert.doesNotThrow(() => assertCurrentMain(main, head));
  assert.throws(
    () =>
      assertCurrentMain(
        { ...main, object: { type: "commit", sha: merge } },
        head,
      ),
    /Main advanced/,
  );
  assert.throws(() =>
    assertCurrentMain({ ...main, ref: "refs/heads/other" }, head),
  );
  assert.throws(() =>
    assertCurrentMain({ ...main, object: { type: "tag", sha: head } }, head),
  );
});

test("CLI records actual PR head; missing token and wrong deployment build exit nonzero", async () => {
  const actual = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const temporary = await mkdtemp(join(tmpdir(), "portfolio-security-gate-"));
  const eventFile = join(temporary, "event.json");
  const outputFile = join(temporary, "output.txt");
  try {
    const context = pr();
    context.event.pull_request.head.sha = actual;
    await writeFile(eventFile, JSON.stringify(context.event));
    const env = {
      ...process.env,
      GITHUB_EVENT_NAME: "pull_request",
      GITHUB_SHA: merge,
      GITHUB_REF: "refs/pull/1/merge",
      GITHUB_REPOSITORY: repository,
      GITHUB_EVENT_PATH: eventFile,
      GITHUB_OUTPUT: outputFile,
      GITHUB_TOKEN: "",
    };
    const target = spawnSync(
      process.execPath,
      ["scripts/gitguardian-gate.mjs", "target"],
      { env, encoding: "utf8" },
    );
    assert.equal(target.status, 0, target.stderr);
    assert.equal(await readFile(outputFile, "utf8"), `sha=${actual}\n`);
    const wait = spawnSync(
      process.execPath,
      ["scripts/gitguardian-gate.mjs", "wait"],
      { env, encoding: "utf8" },
    );
    assert.equal(wait.status, 1);
    assert.match(wait.stderr, /GITHUB_TOKEN is required/);
    const mainContext = push();
    mainContext.event.after = actual;
    await writeFile(eventFile, JSON.stringify(mainContext.event));
    const deploy = spawnSync(
      process.execPath,
      ["scripts/gitguardian-gate.mjs", "deploy"],
      {
        env: {
          ...env,
          GITHUB_EVENT_NAME: "push",
          GITHUB_REF: "refs/heads/main",
          GITHUB_SHA: actual,
          BUILT_SHA: merge,
          VERIFIED_SHA: actual,
        },
        encoding: "utf8",
      },
    );
    assert.equal(deploy.status, 1);
    assert.match(deploy.stderr, /Build SHA differs/);
  } finally {
    await rm(eventFile, { force: true });
    await rm(outputFile, { force: true });
    await rmdir(temporary);
  }
});
