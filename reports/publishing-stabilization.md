# Wilbert Publishing Stabilization Log

Normal publishing remains paused. This log covers publishing-system stabilization only; no post prose or image content is changed by this work.

## Frozen starting point

- Our Old Dad and Publisher repository: `SuperDudePro/Blog-Site`
- Starting `main`: `296b7fb36cfa9dfc7abaa4a715bef54fd6b49546`
- LifeEducation repository: `SuperDudePro/LifeEducationOrg`
- Starting `main`: `ad5a6dd4476aa3e693854ef1fbf4305225c9b2fc`
- Package contract: unchanged

## Verified root causes

1. Browser, server, Our Old Dad, and LifeEducation validation implemented overlapping contracts with different parsers.
2. Server validation stopped at the first defect while browser validation covered only part of the package.
3. GitHub blobs were created before final server validation.
4. Timestamped branches made repeat uploads create duplicate work.
5. Refresh recovery combined local storage with inferred recent-PR selection and could guess among multiple active jobs.
6. Preview selection had to distinguish multiple Vercel projects deployed from `Blog-Site`.
7. Expected-title verification accepted unrelated declared titles.
8. Our Old Dad had geometry-aware cleanup selection; LifeEducation did not.
9. Baseline retirement covered only a subset of Our Old Dad rules and did not support LifeEducation.
10. Existing tests did not exercise the complete publishing journey.

## Implemented stabilization

- Aggregate server preflight returns all detectable defects in one response.
- Complete preflight runs before any GitHub request or blob creation.
- Both site profiles validate exact card, hero, and body image geometry.
- Production file paths and image byte sizes are bound to the completed preflight.
- Publishing uses one deterministic branch per slug and recovers an existing open Publisher PR.
- A repeat upload of the same fixture recovers the same PR.
- Expected title and canonical URL are independently required in preview and production HTML.
- Multiple active jobs are reported as ambiguous instead of guessing a site or post.
- Validated baseline repairs are staged atomically in the publishing PR for both repositories.
- LifeEducation has geometry-aware scanning and newest-first `retrofit:next`.
- The LifeEducation reviewed baseline now records all pre-existing geometry defects.
- Four deterministic end-to-end handler journeys cover new and existing posts for both sites.
- Vercel ignored-build commands prevent the site and Publisher projects from rebuilding each other's unrelated changes.

## Regression map

| # | Failure | Regression location |
|---:|---|---|
| 1, 24 | Expected title missing or incorrect | `publisher/test/publishStatus.test.mjs` |
| 2, 3, 25 | Canonical missing, normalized, or incorrect | `publisher/test/publishStatus.test.mjs` |
| 4 | Wrong Vercel project selected | `publisher/test/publishStatus.test.mjs`, journey matrix |
| 5, 6 | Refresh loses job or requires ZIP | `jobPersistence.test.mjs`, journey matrix resume |
| 7, 8 | Retry/status reset and recovery | journey matrix repeat and status rerun |
| 9, 10 | CTA absent or valid CTA rejected | `inspectPackage.test.mjs`, `validation.test.mjs` |
| 11, 12 | Duplicate or unrecovered PR | `publishingJobs.test.mjs`, journey matrix repeat |
| 13, 14 | Baseline retired at wrong stage or not retired | `baselineRetirement.test.mjs`, retrofit journeys |
| 15, 16 | Wrong/completed `next` result | both repositories' post-contract queue tests |
| 17 | Invalid image dimensions | Publisher inspection/preflight and both repository scanners |
| 18 | Manifest/files/imports/rendering disagree | aggregate preflight tests and journey fixtures |
| 19 | Escaped apostrophes break parsing | `packageManifest.test.mjs`, `inspectionText.test.mjs` |
| 20, 21 | Site-specific source shape | profile, validation, inspection, and journey tests |
| 22 | Merged PR not recognized | journey matrix merge stage |
| 23 | Production commit not recognized | `publishStatus.test.mjs`, journey matrix production stage |
| 26 | Multiple defects revealed sequentially | aggregate preflight tests and no-write handler regression |
| 27, 28 | Failed/successful retrofit advances incorrectly | baseline/queue tests and retrofit journeys |

## Supported-path matrix

Each deterministic journey performs package inspection, aggregate preflight, GitHub blob upload, branch/PR creation, preview selection and verification, refresh recovery, repeat upload, manual merge recognition, deployment-commit recognition, and live title/canonical verification.

| Path | Valid fixture | Repeat/recovery | Merge/live verification |
|---|---:|---:|---:|
| New Our Old Dad | Pass | Pass | Pass |
| Existing Our Old Dad retrofit | Pass | Pass | Pass |
| New LifeEducation | Pass | Pass | Pass |
| Existing LifeEducation retrofit | Pass | Pass | Pass |

## Local acceptance results

- Publisher: 55 tests, TypeScript, and Vite production build passed.
- Our Old Dad: post-contract, post-loading, TypeScript, Vite, route generation, bundle-size, and site validation passed.
- LifeEducation: lint, 29 endpoint/routing tests, 8 post-contract tests, baseline enforcement, TypeScript, Vite, route generation, and site validation passed.
- Supported-path matrix: ten consecutive unchanged runs passed; each run completed all four journeys plus the aggregate-preflight/no-GitHub-write regression.
- Test inputs were synthetic fixtures only. No real post package or generated post image was used.

## Remaining release gates

- Verify CI on the two stabilization PRs.
- Verify controlled Vercel previews without a production post.
- Only then run the three-package acceptance test.
