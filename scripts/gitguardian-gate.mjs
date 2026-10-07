import assert from "node:assert/strict";
import { appendFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

// The installed GitGuardian App, not a similarly named Actions/status check.
export const TRUSTED_CHECK = Object.freeze({
  appId: 46505,
  appSlug: "gitguardian",
  name: "GitGuardian Security Checks",
});
const SHA = /^[a-f0-9]{40}$/;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function resolveTarget({ eventName, event, sha, ref, repository }) {
  assert(REPOSITORY.test(repository), "Invalid repository context");
  assert.equal(event.repository?.full_name, repository, "Repository mismatch");
  assert(SHA.test(sha), "Invalid workflow SHA");
  if (eventName === "pull_request") {
    const pr = event.pull_request;
    assert.equal(pr?.base?.ref, "main", "PR must target main");
    assert.equal(pr?.base?.repo?.full_name, repository, "PR base mismatch");
    assert(SHA.test(pr?.head?.sha), "Invalid PR head SHA");
    // GITHUB_SHA is the synthetic merge commit on a PR; the app scans its head.
    return pr.head.sha;
  }
  assert(
    eventName === "push" || eventName === "workflow_dispatch",
    "Unsupported workflow event",
  );
  assert.equal(ref, "refs/heads/main", "Publication requires main");
  if (eventName === "push") {
    assert.equal(event.ref, ref, "Push ref mismatch");
    assert.equal(event.after, sha, "Push SHA mismatch");
    assert.equal(event.deleted, false, "Deleted branches cannot publish");
  } else {
    assert(
      ["main", "refs/heads/main"].includes(event.ref),
      "Dispatch must select main",
    );
  }
  return sha;
}

export function assertCheckout(actualSha, targetSha) {
  assert(SHA.test(targetSha), "Invalid target SHA");
  assert.equal(actualSha, targetSha, "Checkout differs from target SHA");
}

export function assertDeployment(context, builtSha, verifiedSha, actualSha) {
  assert.notEqual(context.eventName, "pull_request", "PR cannot deploy");
  const targetSha = resolveTarget(context);
  assertCheckout(actualSha, targetSha);
  assert.equal(builtSha, targetSha, "Build SHA differs from deployment SHA");
  assert.equal(
    verifiedSha,
    targetSha,
    "Security SHA differs from deployment SHA",
  );
  return targetSha;
}

export function evaluateChecks(runs, targetSha) {
  assert(SHA.test(targetSha), "Invalid check target SHA");
  assert(Array.isArray(runs), "Malformed check-run response");
  const candidates = runs.filter(
    (run) =>
      run?.name === TRUSTED_CHECK.name &&
      run?.app?.id === TRUSTED_CHECK.appId &&
      run?.app?.slug === TRUSTED_CHECK.appSlug,
  );
  if (!candidates.length) return { state: "waiting", reason: "check missing" };
  for (const run of candidates) {
    assert(Number.isSafeInteger(run.id) && run.id > 0, "Invalid check ID");
    assert.equal(run.head_sha, targetSha, "GitGuardian check has wrong SHA");
  }
  // Never let an old success hide a newer pending or failed rerun.
  const latest = candidates.reduce((a, b) => (a.id > b.id ? a : b));
  if (latest.status !== "completed") {
    assert(
      ["queued", "in_progress", "waiting", "pending", "requested"].includes(
        latest.status,
      ),
      "Invalid check status",
    );
    return { state: "waiting", reason: "check pending", id: latest.id };
  }
  assert.equal(
    latest.conclusion,
    "success",
    "GitGuardian check did not succeed",
  );
  assert(
    typeof latest.completed_at === "string" &&
      Number.isFinite(Date.parse(latest.completed_at)),
    "Completed check lacks completion timestamp",
  );
  return { state: "success", id: latest.id };
}

export function assertCurrentMain(response, targetSha) {
  assert.equal(response?.ref, "refs/heads/main", "Unexpected main ref");
  assert.equal(response?.object?.type, "commit", "Main must point to a commit");
  assert.equal(
    response?.object?.sha,
    targetSha,
    "Main advanced; refusing stale deploy",
  );
}

export function createGitHubClient(repository, token, fetchImpl = fetch) {
  assert(REPOSITORY.test(repository), "Invalid API repository");
  assert(
    typeof token === "string" && token.length > 0,
    "GITHUB_TOKEN is required",
  );
  return async (path, timeoutMs = 20_000) => {
    assert(path.startsWith("/"), "Invalid API path");
    const response = await fetchImpl(
      `https://api.github.com/repos/${repository}${path}`,
      {
        method: "GET",
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    assert(response.ok, `GitHub API failed (HTTP ${response.status})`);
    return response.json();
  };
}

export async function listChecks(request, targetSha, timeoutMs = 20_000) {
  assert(SHA.test(targetSha), "Invalid API target SHA");
  const runs = [];
  let total;
  for (let page = 1; page <= 10; page++) {
    const result = await request(
      `/commits/${targetSha}/check-runs?check_name=${encodeURIComponent(TRUSTED_CHECK.name)}&filter=all&per_page=100&page=${page}`,
      timeoutMs,
    );
    assert(
      Number.isSafeInteger(result.total_count) &&
        result.total_count >= 0 &&
        result.total_count <= 1000 &&
        Array.isArray(result.check_runs) &&
        result.check_runs.length <= 100,
      "Malformed or excessive check-run results",
    );
    total ??= result.total_count;
    assert.equal(result.total_count, total, "Checks changed during pagination");
    runs.push(...result.check_runs);
    if (runs.length >= total) {
      assert.equal(runs.length, total, "Incomplete check-run results");
      const ids = runs.map((run) => run?.id);
      assert.equal(
        new Set(ids).size,
        ids.length,
        "Duplicate check-run results",
      );
      return runs;
    }
    assert.equal(result.check_runs.length, 100, "Truncated check-run page");
  }
  throw new Error("Check-run pagination limit exceeded");
}

export async function waitForGitGuardian({
  request,
  targetSha,
  timeoutMs = 600_000,
  intervalMs = 15_000,
  now = Date.now,
  pause = sleep,
  log = console.log,
}) {
  assert(timeoutMs > 0 && intervalMs > 0, "Invalid polling bounds");
  const deadline = now() + timeoutMs;
  const boundedRequest = (path) => {
    const remaining = deadline - now();
    assert(remaining > 0, "GitGuardian verification timed out");
    return request(path, Math.min(20_000, remaining));
  };
  while (now() < deadline) {
    const runs = await listChecks(boundedRequest, targetSha);
    assert(now() < deadline, "GitGuardian verification timed out");
    const result = evaluateChecks(runs, targetSha);
    if (result.state === "success") {
      log(`GitGuardian app check ${result.id} succeeded for ${targetSha}.`);
      return result;
    }
    log(`Waiting for GitGuardian on ${targetSha}: ${result.reason}.`);
    await pause(Math.min(intervalMs, Math.max(0, deadline - now())));
  }
  throw new Error(
    "GitGuardian verification timed out; publication remains blocked",
  );
}

async function main() {
  const event = JSON.parse(
    await readFile(process.env.GITHUB_EVENT_PATH, "utf8"),
  );
  const context = {
    eventName: process.env.GITHUB_EVENT_NAME,
    event,
    sha: process.env.GITHUB_SHA,
    ref: process.env.GITHUB_REF,
    repository: process.env.GITHUB_REPOSITORY,
  };
  const targetSha = resolveTarget(context);
  const actualSha = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  assertCheckout(actualSha, targetSha);
  const mode = process.argv[2];
  if (mode === "target") {
    assert(process.env.GITHUB_OUTPUT, "GITHUB_OUTPUT is required");
    await appendFile(process.env.GITHUB_OUTPUT, `sha=${targetSha}\n`);
    console.log(`Checked out exact target ${targetSha}.`);
    return;
  }
  assert(mode === "wait" || mode === "deploy", "Unknown gate mode");
  if (mode === "deploy") {
    assertDeployment(
      context,
      process.env.BUILT_SHA,
      process.env.VERIFIED_SHA,
      actualSha,
    );
  }
  const request = createGitHubClient(
    context.repository,
    process.env.GITHUB_TOKEN,
  );
  await waitForGitGuardian({ request, targetSha });
  if (mode === "deploy") {
    // Re-read the branch after polling, immediately before the Pages action.
    assertCurrentMain(await request("/git/ref/heads/main"), targetSha);
    console.log(`Main still points to the tested and approved ${targetSha}.`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(`Security gate failed: ${error.message}`);
    process.exitCode = 1;
  });
}
