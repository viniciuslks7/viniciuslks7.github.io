# GitGuardian app publication gate

Publication requires both the current run's build/test job and its GitGuardian app verification job. The trusted result is `GitGuardian Security Checks`, from GitHub App ID `46505`, slug `gitguardian`, with the exact expected `head_sha`, `status: completed` and `conclusion: success`. A similarly named Actions check or commit status cannot approve publication.

The gate queries all pages of that check name for the exact SHA, using only the existing `GITHUB_TOKEN` and `checks: read`. It selects the newest trusted check run by ID so an older success cannot hide a pending or failed rerun. Missing or pending checks are polled every 15 seconds for at most ten minutes. Any completed non-success, malformed/incomplete response, HTTP error, wrong SHA or timeout fails closed. No secret is requested, generated or logged; the gate does not create check runs.

## Commit binding and deployment

- PRs check out and test `pull_request.head.sha`. GitHub's synthetic PR merge SHA is not substituted for the app-scanned head. The separate quality workflow may also test the merge result. PRs never deploy.
- Main pushes require `event.after == GITHUB_SHA`, an undeleted branch and `refs/heads/main`. Manual runs must select `main`; tags and other branches cannot deploy.
- Build and gate jobs publish their actual checked-out SHA as outputs. The artifact name includes the build SHA. Deployment requires identical event, checkout, build and security SHAs, rechecks the app result, then reads `refs/heads/main` immediately before publishing that artifact.
- A merge/squash/rebase creating a new SHA requires its own GitGuardian app result; an earlier PR-head check is insufficient. If the installed app does not emit a successful check for a main commit, deployment stops. Investigate the app's configured behavior rather than bypassing the gate.
- All main publication runs share one concurrency group; a newer main run cancels an older one. PR groups are separate. The pre-deploy main read prevents a stale run from publishing after main has already advanced. Branch changes after that last read rely on GitHub's workflow cancellation; this is not an atomic lock on repository updates.

The build token has read permissions; Pages/OIDC write permissions are confined to deployment. Checkout credentials are not persisted. `configure-pages` runs only for main publication, with enablement left disabled; this patch does not change repository Pages settings.

## Scope and evidence

This gate verifies the installed GitGuardian app's result. It neither runs ggshield nor claims equivalent scanning scope, binary coverage or historical coverage. GitGuardian app configuration and its reported result remain the source of scan coverage. The deployment gate is workflow logic; this patch does not create branch protection rules or change repository permissions.

Before this patch, exact commit `43299fead319e37230a297f7337bd91f05cb8abd` had a successful app check ([run 112778231979](https://github.com/viniciuslks7/viniciuslks7.github.io/runs/112778231979)); that result does not approve the new gate commit. Run `npm run test:security` for deterministic offline positive/negative tests, including the CLI and mocked Checks API. Local testing does not confirm the new workflow's remote token permissions, new-SHA app approval or a deployment.

Official references: [Checks API](https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference), [PR event SHA semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request), [token permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions), [Pages artifact naming](https://github.com/actions/deploy-pages/blob/v4/action.yml).
