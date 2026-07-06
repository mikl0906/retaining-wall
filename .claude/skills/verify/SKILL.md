---
name: verify
description: Build, run, and drive the retaining-wall app to verify changes end-to-end.
---

# Verifying the retaining-wall app

Vite + React SPA with a Three.js canvas. Model state persists in the URL
query string (`?model=...`) — reading `page.url()` before/after an action is
the cheapest oracle for "did the model change".

## Launch

```powershell
npx vite --port 5199 --strictPort   # run in background; ready in <1s
```

## Drive (Playwright)

Playwright ≥1.61 is available via npx; browsers live in
`%LOCALAPPDATA%\ms-playwright`. Install the library into a scratch dir with
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright@<npx version>`.

Useful handles:
- Readiness: wait for `[title="Wall height"]` (a drei Html overlay; appears once the 3D scene is up).
- Cards: `[data-slot=card]` filtered by `hasText` ("Partial factors", "Model information", "Ground materials", "Results").
- Results values: `p:has-text('Overturn') + p` / `p:has-text('Sliding') + p`; green = `text-green-500`, red = `text-red-500`.
- Default model expected results: Overturn 59%, Sliding 78%.
- 3D NumberInput overlays: click the `[title="..."]` div, then type into `input.w-16`, press Enter.
- 3D dimension drag: cones/lines are pure magenta — screenshot, scan for `r>180 && b>180 && g<100` pixels (skip x<450, that's the card column), bucket into ~12px cells, drag the densest blob; verify via URL change.
- Open file: `input[type=file]` is hidden — use `setInputFiles` directly.
- Save file: `page.waitForEvent("download")` + click "Save to file".
- Toasts: `[data-sonner-toast]` with `hasText`.
- Report preview: click "Open Preview", grab the non-main frame, allow ~2.5s for template fetch + pagination. Pagination check: count `.preview-page` in the frame (default model → 3 pages) and assert each `.preview-page-content` has `scrollHeight === clientHeight` (no overflow). The content div must stay absolutely positioned inside the aspect-ratio page or pages grow instead of splitting.
- Cross-section figure: one inline `<svg>` in the report (page 1); its `<text>` nodes carry the pressure values, which must match the 3D canvas pressure labels.

## Gotchas

- `npm run dev` passes `--open` (pops the user's browser) — launch `npx vite` directly instead.
- The report template is fetched from `/report.eta` at runtime; template edits need no rebuild but do need a preview re-open.
