# TBHF Brand Re-theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-theme the wiki's accent colors, typography, and logo to match
The Black History Foundation's real, documented brand (Firebrick Red / Gold
/ Dark Green, Helvetica + Neue Kabel), while keeping the parchment
background palette unchanged.

**Architecture:** This is a pure CSS/wikitext modification project — no new
JS, no new templates, no new pure-function/bootstrap pair. It modifies
existing declarations in the shared `src/citizen-theme.css` (token values,
not new selectors) and one existing wikitext file
(`src/templates/MainPage.wikitext`), plus documents a manual asset-upload
requirement in the existing smoke-test checklist.

**Tech Stack:** Plain CSS (custom properties), MediaWiki's
`Special:Redirect/file/` special page for stable self-hosted font URLs,
Node's built-in test runner (`node:test` + `node:assert/strict`, Node 24 —
no npm dependencies).

## Global Constraints

- Parchment backgrounds, espresso text, and borders are UNCHANGED —
  `--color-surface-0/1/2`, `--color-base`, `--color-emphasized`,
  `--border-color-base` keep their existing values. Only accent colors and
  typography change.
- Color mapping (exact values, computed and verified in the spec): brand/link
  → Firebrick Red `#B22222` (oklch `H=26.81`, `C=0.1797`, `L=49.68%`); gold
  accent → `#FFD700`; terracotta accent → `#B22222` (merged with brand/link
  — the real brand has one red, not two); success → `#006400`.
  `--bhf-color-text-on-gold` stays `#2A1D14` (still passes AA against the
  new, brighter gold: 11.66:1).
- Gold remains fill-only, never text-on-parchment (1.21:1 — an even more
  severe AA failure than the old antique gold's 2.77:1). No existing
  component needs to change shape for this — only hex values change.
- Fonts: self-hosted Helvetica + Neue Kabel, scoped to exactly 5
  weight/style files actually used by this theme's CSS — not the full font
  families. Referenced via `/wiki/Special:Redirect/file/<filename>` (a
  stable MediaWiki URL that always resolves to a file's current location,
  since `MediaWiki:Citizen.css` isn't processed as wikitext and can't use
  `{{filepath:}}`).
- The actual binary font files and logo PNG are NOT part of this repo's
  deliverable — this plan documents the exact filenames required and where
  to upload them (as wiki `File:` pages), consistent with how earlier
  features documented (but didn't commit) other external assets.

---

### Task 1: Color token mapping

**Files:**
- Modify: `src/citizen-theme.css:33-54` (the `:root` block's brand-hue and
  accent-color declarations)
- Modify: `tests/citizen-theme.test.js:12-27`

**Interfaces:**
- Produces: `--color-progressive-oklch__h/c/l`, `--bhf-color-accent-gold`,
  `--bhf-color-accent-terracotta`, `--bhf-color-success` now hold the TBHF
  brand values. Every existing component (badges, category tiles, infobox,
  pull-quote, citation confidence tags, lead status badges) already
  references these via `var(--bhf-color-accent-gold)` etc., not hardcoded
  hex — so no other file needs to change for the new colors to take effect.

- [ ] **Step 1: Write the failing test**

Replace the existing test at `tests/citizen-theme.test.js:12-16`:

```js
// OLD — replace this test:
test('defines the brand hue/chroma/lightness on :root', () => {
  assert.match(css, /--color-progressive-oklch__h:\s*56\.01/);
  assert.match(css, /--color-progressive-oklch__c:\s*0\.0614/);
  assert.match(css, /--color-progressive-oklch__l:\s*38\.28%/);
});
```

with:

```js
// NEW:
test('defines the brand hue/chroma/lightness on :root', () => {
  assert.match(css, /--color-progressive-oklch__h:\s*26\.81/);
  assert.match(css, /--color-progressive-oklch__c:\s*0\.1797/);
  assert.match(css, /--color-progressive-oklch__l:\s*49\.68%/);
});
```

Replace the existing test at `tests/citizen-theme.test.js:23-27`:

```js
// OLD — replace this test:
test('defines custom accent properties not covered by Citizen tokens', () => {
  assert.match(css, /--bhf-color-accent-gold:\s*#B8863B/i);
  assert.match(css, /--bhf-color-accent-terracotta:\s*#A8482F/i);
  assert.match(css, /--bhf-color-success:\s*#3B5C40/i);
});
```

with:

```js
// NEW:
test('defines custom accent properties matching the TBHF brand', () => {
  assert.match(css, /--bhf-color-accent-gold:\s*#FFD700/i);
  assert.match(css, /--bhf-color-accent-terracotta:\s*#B22222/i);
  assert.match(css, /--bhf-color-success:\s*#006400/i);
});
```

Leave the test at `tests/citizen-theme.test.js:18-21` ("tunes the surface
ramp toward warm parchment") completely unchanged — the surface-0 oklch
sub-tokens are untouched by this task.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — 2 tests fail (old hex/oklch values no longer present since
you haven't changed the CSS yet; this step just confirms the NEW test
assertions don't already accidentally pass).

- [ ] **Step 3: Update the CSS**

In `src/citizen-theme.css`, replace:

```css
	/* Brand hue/chroma/lightness — drives Citizen's link/accent color AND
	 * (via shared hue) tints the surface ramp toward warm parchment tones.
	 * Computed from #5C3A21 (deep espresso brown). */
	--color-progressive-oklch__h: 56.01;
	--color-progressive-oklch__c: 0.0614;
	--color-progressive-oklch__l: 38.28%;

	/* Nudge the surface ramp lighter/warmer than Citizen's default so
	 * surface-0 lands close to #F4EDE1 (parchment) instead of neutral grey. */
	--color-surface-0-oklch__l: 94.8%;
	--color-surface-0-oklch__c: 0.018;

	/* Accent colors with no equivalent Citizen token — consumed directly by
	 * our own component CSS (badges, pull-quotes, category tiles). Gold is
	 * only ever used as a filled background with --bhf-color-text-on-gold on
	 * top (2.77:1 as text-on-parchment fails AA; 5.07:1 as a filled chip
	 * with espresso text passes). */
	--bhf-color-accent-gold: #B8863B;
	--bhf-color-text-on-gold: #2A1D14;
	--bhf-color-accent-terracotta: #A8482F;
	--bhf-color-success: #3B5C40;
```

with:

```css
	/* Brand hue/chroma/lightness — drives Citizen's link/accent color AND
	 * (via shared hue) tints the surface ramp toward warm parchment tones.
	 * Computed from #B22222 (TBHF brand Firebrick Red). */
	--color-progressive-oklch__h: 26.81;
	--color-progressive-oklch__c: 0.1797;
	--color-progressive-oklch__l: 49.68%;

	/* Nudge the surface ramp lighter/warmer than Citizen's default so
	 * surface-0 lands close to #F4EDE1 (parchment) instead of neutral grey.
	 * Harmless now that --color-surface-0/1/2 are also set directly below —
	 * kept for the legacy token pipeline, same as before. */
	--color-surface-0-oklch__l: 94.8%;
	--color-surface-0-oklch__c: 0.018;

	/* TBHF brand accent colors (Firebrick Red / Gold / Dark Green), per
	 * tbhfdn.org's README-documented design system. Terracotta's former role
	 * (secondary accent: disputed citations, in-progress leads, the
	 * contribute-prompt border) merges into Firebrick Red — the real brand
	 * has one red, not two. Gold is only ever used as a filled background
	 * with --bhf-color-text-on-gold on top (1.21:1 as text-on-parchment
	 * fails AA; 11.66:1 as a filled chip with espresso text passes). */
	--bhf-color-accent-gold: #FFD700;
	--bhf-color-text-on-gold: #2A1D14;
	--bhf-color-accent-terracotta: #B22222;
	--bhf-color-success: #006400;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests — including every pre-existing test that
references `var(--bhf-color-accent-gold)` etc. by variable name rather than
hardcoded hex, which needs no changes since it never asserted a specific
color value, only that the component uses the variable)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: re-theme accent colors to the TBHF brand (Firebrick Red, Gold, Dark Green)"
```

---

### Task 2: Self-hosted TBHF typography

**Files:**
- Modify: `src/citizen-theme.css:1-31` (the `@import`/`@font-face` block at
  the top of the file) and `src/citizen-theme.css`'s `:root` block (the two
  `--font-family-citizen-*` lines)
- Modify: `tests/citizen-theme.test.js:29-42`

**Interfaces:**
- Produces: `--font-family-citizen-serif` now resolves to `'TBHF-NeueKabel'`
  (a new custom `@font-face` name), `--font-family-citizen-base` to
  `'TBHF-Helvetica'`. Every component that already uses
  `var(--font-family-citizen-serif)` or `var(--font-family-citizen-base)`
  picks up the new fonts automatically — no other file changes.

- [ ] **Step 1: Write the failing test**

Replace the three existing tests at `tests/citizen-theme.test.js:29-42`:

```js
// OLD — replace these three tests:
test('overrides Citizen font-family variables with the archival type system', () => {
  assert.match(css, /--font-family-citizen-serif:\s*'Source Serif 4',\s*'Source-Serif-fallback'/);
  assert.match(css, /--font-family-citizen-base:\s*'Source Sans 3',\s*'Source-Sans-fallback'/);
});

test('imports the chosen Google Fonts with a full weight range', () => {
  assert.match(css, /fonts\.googleapis\.com\/css2\?family=Source\+Serif\+4/);
  assert.match(css, /fonts\.googleapis\.com\/css2\?family=Source\+Sans\+3/);
});

test('ships a metric-matched fallback face to avoid font-flicker layout shift', () => {
  assert.match(css, /@font-face\s*{\s*font-family:\s*'Source-Sans-fallback'/);
  assert.match(css, /@font-face\s*{\s*font-family:\s*'Source-Serif-fallback'/);
});
```

with:

```js
// NEW:
test('overrides Citizen font-family variables with the TBHF brand fonts', () => {
  assert.match(css, /--font-family-citizen-serif:\s*'TBHF-NeueKabel',\s*Helvetica,\s*Arial,\s*sans-serif/);
  assert.match(css, /--font-family-citizen-base:\s*'TBHF-Helvetica',\s*Helvetica,\s*Arial,\s*sans-serif/);
});

test('defines self-hosted @font-face rules for all five required weights/styles', () => {
  assert.match(
    css,
    /@font-face\s*{\s*font-family:\s*'TBHF-Helvetica';\s*src:\s*url\(\s*'\/wiki\/Special:Redirect\/file\/Helvetica\.ttf'\s*\)[^}]*font-weight:\s*400;\s*font-style:\s*normal;/
  );
  assert.match(
    css,
    /url\(\s*'\/wiki\/Special:Redirect\/file\/Helvetica-Bold\.ttf'\s*\)[^}]*font-weight:\s*700;/
  );
  assert.match(
    css,
    /url\(\s*'\/wiki\/Special:Redirect\/file\/Helvetica-Oblique\.ttf'\s*\)[^}]*font-style:\s*italic;/
  );
  assert.match(
    css,
    /font-family:\s*'TBHF-NeueKabel';\s*src:\s*url\(\s*'\/wiki\/Special:Redirect\/file\/NeueKabel-Book\.otf'\s*\)/
  );
  assert.match(
    css,
    /url\(\s*'\/wiki\/Special:Redirect\/file\/NeueKabel-Bold\.otf'\s*\)[^}]*font-weight:\s*700;/
  );
});

test('no longer imports Google Fonts', () => {
  assert.ok(!css.includes('fonts.googleapis.com'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — the new `@font-face`/font-family assertions don't match
yet, and `fonts.googleapis.com` is still present.

- [ ] **Step 3: Update the CSS**

At the top of `src/citizen-theme.css`, replace everything from the first
`@import` line through the end of the second `@font-face` block:

```css
/* OLD — replace this entire block: */
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@200..900&display=swap');

/* Metric-matched fallback for Source Sans 3, generated via
 * https://screenspan.net/fallback to prevent layout shift while the web
 * font loads. Ascent/descent/line-gap overrides approximate Arial's metrics
 * scaled to Source Sans 3 — regenerate if the body font ever changes. */
@font-face {
	font-family: 'Source-Sans-fallback';
	src: local( 'Arial' );
	ascent-override: 90%;
	descent-override: 22%;
	line-gap-override: 0%;
}

/* Metric-matched fallback for Source Serif 4, generated via
 * https://screenspan.net/fallback to prevent layout shift while the web
 * font loads. Ascent/descent/line-gap overrides approximate Georgia's metrics
 * scaled to Source Serif 4 — regenerate if the heading font ever changes. */
@font-face {
	font-family: 'Source-Serif-fallback';
	src: local( 'Georgia' );
	ascent-override: 88%;
	descent-override: 24%;
	line-gap-override: 0%;
}
```

with:

```css
/* TBHF brand fonts (Helvetica + Neue Kabel), self-hosted on the wiki as
 * uploaded File: pages, referenced via MediaWiki's Special:Redirect/file/
 * special page — a stable URL that always resolves to a file's current
 * location regardless of its actual hashed upload path. MediaWiki:Citizen.css
 * is not processed as wikitext, so {{filepath:}} doesn't work here; this is
 * the standard workaround. Scoped to only the weights this theme's CSS
 * actually uses, not the full Helvetica/Neue Kabel families. Each of these
 * five files must be uploaded to the wiki with the exact filename in its
 * src url() below — see docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
 * for the upload checklist. */
@font-face {
	font-family: 'TBHF-Helvetica';
	src: url( '/wiki/Special:Redirect/file/Helvetica.ttf' ) format( 'truetype' );
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}

@font-face {
	font-family: 'TBHF-Helvetica';
	src: url( '/wiki/Special:Redirect/file/Helvetica-Bold.ttf' ) format( 'truetype' );
	font-weight: 700;
	font-style: normal;
	font-display: swap;
}

@font-face {
	font-family: 'TBHF-Helvetica';
	src: url( '/wiki/Special:Redirect/file/Helvetica-Oblique.ttf' ) format( 'truetype' );
	font-weight: 400;
	font-style: italic;
	font-display: swap;
}

@font-face {
	font-family: 'TBHF-NeueKabel';
	src: url( '/wiki/Special:Redirect/file/NeueKabel-Book.otf' ) format( 'opentype' );
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}

@font-face {
	font-family: 'TBHF-NeueKabel';
	src: url( '/wiki/Special:Redirect/file/NeueKabel-Bold.otf' ) format( 'opentype' );
	font-weight: 700;
	font-style: normal;
	font-display: swap;
}
```

Then, within the `:root` block, replace:

```css
	/* Archival typography system — overrides Citizen's default font-family. */
	--font-family-citizen-serif: 'Source Serif 4', 'Source-Serif-fallback';
	--font-family-citizen-base: 'Source Sans 3', 'Source-Sans-fallback';
```

with:

```css
	/* TBHF brand typography system — overrides Citizen's default
	 * font-family. Despite the "-serif" in this Citizen-native variable
	 * name (not renamed by this project), it now carries Neue Kabel, a
	 * sans-serif heading face — there is no serif anywhere in this
	 * typography system post-retheme. Neue Kabel has no common
	 * system-installed equivalent, so its fallback degrades straight to
	 * the same sans-serif stack as the body font. */
	--font-family-citizen-serif: 'TBHF-NeueKabel', Helvetica, Arial, sans-serif;
	--font-family-citizen-base: 'TBHF-Helvetica', Helvetica, Arial, sans-serif;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: switch to self-hosted TBHF brand fonts (Helvetica, Neue Kabel)"
```

---

### Task 3: Real logo in the masthead

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Modify: `src/templates/MainPage.wikitext:2-6`

**Interfaces:**
- Produces: `.bhf-masthead__logo` CSS class, consumed by the
  `[[File:TBHF-Logo.png|...]]` image markup in `MainPage.wikitext`.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the masthead logo image class', () => {
  const block = css.match(/\.bhf-masthead__logo\s*{[^}]*}/s)[0];
  assert.match(block, /display:\s*block/);
  assert.match(block, /margin:\s*0\s*auto/);
  assert.match(block, /max-height:\s*80px/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-masthead__logo` not defined yet.

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-masthead__logo {
	display: block;
	margin: 0 auto;
	max-height: 80px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Update the Main Page template**

In `src/templates/MainPage.wikitext`, replace:

```wikitext
<div class="bhf-masthead bhf-texture-parchment">
'''The Black History Foundation Wiki'''

<span class="bhf-masthead__tagline">''Discover. Preserve. Share.''</span>
</div>
```

with:

```wikitext
<div class="bhf-masthead bhf-texture-parchment">
[[File:TBHF-Logo.png|center|link=|alt=The Black History Foundation|class=bhf-masthead__logo]]

<span class="bhf-masthead__tagline">''Discover. Preserve. Share.''</span>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/MainPage.wikitext
git commit -m "feat: replace masthead text wordmark with the real TBHF logo"
```

---

### Task 4: Document required asset uploads + extend the smoke-test checklist

**Files:**
- Modify: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1-3 (this task adds the manual
  upload requirement and verification steps that make them actually work
  on a live wiki).

- [ ] **Step 1: Add the asset-upload section and checklist items**

Append to `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`:

```markdown
## Required asset uploads for the TBHF brand re-theme

Before running the checklist items below, upload these 6 files to the wiki
as `File:` pages (Special:Upload), using these EXACT filenames — the CSS's
`Special:Redirect/file/` URLs and the Main Page's `[[File:TBHF-Logo.png]]`
reference these names literally:

- `File:Helvetica.ttf` — from TBHFDN's `public/Fonts/Helvetica/Helvetica.ttf`
- `File:Helvetica-Bold.ttf` — from `public/Fonts/Helvetica/Helvetica-Bold.ttf`
- `File:Helvetica-Oblique.ttf` — from `public/Fonts/Helvetica/Helvetica-Oblique.ttf`
- `File:NeueKabel-Book.otf` — from `public/Fonts/Neue-Kabel/NeueKabel-Book.otf`
- `File:NeueKabel-Bold.otf` — from `public/Fonts/Neue-Kabel/NeueKabel-Bold.otf`
- `File:TBHF-Logo.png` — from `public/Logos/TBHF_Logo_Full Color.png`

- [ ] Links and borders across the site render in Firebrick Red (not the
      old deep brown)
- [ ] The gold "Sources cited" badge, category tiles, and lead "Open"
      status badge all show espresso text on a bright gold (`#FFD700`)
      background — never gold as small text
- [ ] The "Reviewer confirmed" badge, "resolved" lead status, and verified
      citation confidence tag all render in Dark Green
- [ ] A disputed citation tag, an in-progress lead status badge, and the
      dashed contribute-prompt border all render in Firebrick Red (the
      same red as links — this is the intended terracotta-to-red merge,
      not a bug)
- [ ] Headings render in Neue Kabel and body text in Helvetica once the
      5 font files are uploaded — if a font isn't uploaded yet, that
      role should cleanly fall back to system Helvetica/Arial, not show
      a broken/missing-glyph state
- [ ] The Main Page masthead shows the real TBHF logo image, centered,
      capped at 80px tall — not the old text wordmark
- [ ] Parchment backgrounds, espresso body text, and borders are
      UNCHANGED from before this re-theme
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: document required asset uploads and extend smoke-test checklist for the TBHF brand re-theme"
```

## Post-plan follow-ups (not part of this plan)

- Actually uploading the 6 asset files to a live wiki and running the
  extended smoke-test checklist (same outstanding human follow-up as every
  earlier feature — no Docker/PHP in the environment this plan was authored
  in).
- Correcting tbhfdn.org's own "cruise theme" CSS discrepancy against its
  own README (a TBHFDN-repo concern, not this project's, per the spec).
