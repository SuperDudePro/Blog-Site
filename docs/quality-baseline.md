# Accessibility and performance baseline — Our Old Dad

Recorded from a clean production build on 2026-09-28. This is an engineering baseline, not an accessibility certification or a user traffic Core Web Vitals dataset.

## Build assets

| Measure | Baseline |
| --- | ---: |
| Initial JavaScript (uncompressed) | 228,792 bytes |
| Initial CSS (uncompressed) | 21,110 bytes |
| All built images (across routes) | 90,018,730 bytes (288 files) |
| Largest built image | 784,444 bytes |

The largest individual post images are about 0.75 MiB. The full 90 MiB image set spans many posts; it is not a single-route download. The full image set measures the build output, not bytes requested by a particular visitor. AQR poster assets and documents need separate judgment before asset migration.

CI runs `npm run build` and `npm run audit:quality` on pull requests and main. The script fails if initial JavaScript, CSS, total images, or the largest image exceeds the recorded value by 25% plus a small fixed allowance (32 KiB JS, 16 KiB CSS, 1 MiB image total, 128 KiB largest image). These limits signal material changes rather than targeting a perfect score. Review the effect on a route before accepting an intentional budget increase; refresh with `npm run baseline:quality` only after review.

The browser audit visits `/, /archive, /contact` against the built local preview. It runs axe WCAG 2.0–2.2 A/AA and best-practice checks, fails on serious/critical findings, and checks one main landmark, one H1, and first keyboard focus visibility. It writes `quality-report.json` as a CI artifact with all findings and per-route TTFB, DOM content load, FCP, LCP, CLS and resource count. Compare timing reports from equivalent CI runs; lab timings fluctuate, so they are reported rather than hard-gated. LCP/CLS are lab observations and do not represent field Core Web Vitals.

## Manual review when layout, navigation, or forms change

- Tab through navigation, content links, and forms in both directions; activate the skip link and confirm focus stays visible and follows reading order.
- Check header/main/footer landmarks, heading hierarchy, dialog state (if present), and screen-reader names for controls.
- Confirm form instructions, errors, and status changes are associated with inputs and announced as needed, including validation failures. Do not send real submissions during routine review.
- Check informative image descriptions and empty alt text for decorative images; review media and embedded content separately.
- Review text, focus indicators, and icon contrast in light/dark and hover/focus states; inspect narrow mobile widths and 200% zoom.
- For performance changes, inspect route-specific network requests and image dimensions/delivery, and compare CI LCP/CLS with prior reports. If real-user metrics are available, prefer those for prioritization.

This checklist deliberately keeps judgment-heavy accessibility and performance decisions with a human reviewer. The automated sample does not cover every route, every viewport, or every interaction.
