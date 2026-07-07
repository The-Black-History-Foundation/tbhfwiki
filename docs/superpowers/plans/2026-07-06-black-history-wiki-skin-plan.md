# Black History Community Wiki — Citizen Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Theme the stock Citizen MediaWiki skin into a "Heritage Archival" look for
The Black History Foundation's community wiki, entirely through on-wiki CSS/JS and
wikitext templates — no forked skin package.

**Architecture:** All deliverables are plain files in this repo that get copied onto
three MediaWiki pages (`MediaWiki:Citizen.css`, `MediaWiki:Citizen.js`,
`MediaWiki:Citizen-preferences.json`), a `LocalSettings.php` snippet, and a handful of
wikitext templates. CSS overrides Citizen's documented custom properties (palette,
typography) and adds new component classes (hero, discovery rail, infobox, pull-quote,
badge). JS is split into pure, unit-testable transform/render functions plus a thin
`mw.Api()` bootstrap that wires them to MediaWiki's core API (and the PageViewInfo
extension's API, with graceful degradation if it's absent).

**Tech Stack:** Plain CSS (custom properties), vanilla JS (CommonJS-free, browser
globals `mw`/`fetch` only in the bootstrap layer), Node's built-in test runner
(`node:test` + `node:assert`, Node 24 — no npm dependencies), MediaWiki wikitext.

## Global Constraints

- No forked Citizen skin package — only `MediaWiki:Citizen.css`,
  `MediaWiki:Citizen.js`, `MediaWiki:Citizen-preferences.json`, `LocalSettings.php`
  config, and wikitext templates.
- No new PHP extensions except the already-flagged optional dependency: PageViewInfo
  (for the Trending module only). Everything else must degrade gracefully if
  PageViewInfo is absent.
- Palette: background `#F4EDE1`, surface `#FBF7EF`, text `#2A1D14`, link/brand
  `#5C3A21`, gold accent `#B8863B`, terracotta accent `#A8482F`, border `#D9CBB4`,
  success/verified `#3B5C40` (all defined in the spec).
- Gold (`#B8863B`) must only be used as a filled background with espresso
  (`#2A1D14`) text on top, or for large headings/icons/borders — never as small text
  color directly on parchment or ivory (fails WCAG AA at 2.77:1; passes at 5.07:1 as a
  filled chip).
- Light theme only — no dark mode in this phase.
- All new decorative/animated CSS must be gated off under Citizen's performance-mode
  class `.citizen-feature-performance-mode-clientpref-1` (or built on Citizen's own
  tokens, which already respond to performance mode).

---

### Task 1: Repo scaffold + palette CSS

**Files:**
- Create: `src/citizen-theme.css`
- Create: `tests/citizen-theme.test.js`
- Create: `README.md`

**Interfaces:**
- Produces: `src/citizen-theme.css` — the file every later CSS task appends to. All
  later CSS tasks add rules to this same file; nothing else creates a second stylesheet.

- [ ] **Step 1: Write the failing test**

```js
// tests/citizen-theme.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'citizen-theme.css'),
  'utf8'
);

test('defines the brand hue/chroma/lightness on :root', () => {
  assert.match(css, /--color-progressive-oklch__h:\s*56\.01/);
  assert.match(css, /--color-progressive-oklch__c:\s*0\.0614/);
  assert.match(css, /--color-progressive-oklch__l:\s*38\.28%/);
});

test('tunes the surface ramp toward warm parchment', () => {
  assert.match(css, /--color-surface-0-oklch__l:\s*94\.8%/);
  assert.match(css, /--color-surface-0-oklch__c:\s*0\.018/);
});

test('defines custom accent properties not covered by Citizen tokens', () => {
  assert.match(css, /--bhf-color-accent-gold:\s*#B8863B/i);
  assert.match(css, /--bhf-color-accent-terracotta:\s*#A8482F/i);
  assert.match(css, /--bhf-color-success:\s*#3B5C40/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `src/citizen-theme.css` does not exist yet (ENOENT).

- [ ] **Step 3: Write the CSS**

```css
/* src/citizen-theme.css
 * Paste this entire file's contents into MediaWiki:Citizen.css on the wiki.
 * "Heritage Archival" palette — see docs/superpowers/specs/2026-07-06-black-history-wiki-skin-design.md
 */

:root {
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
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the README stub**

```markdown
# TBHF Wiki Skin — Citizen theme

Theming for The Black History Foundation's community wiki, built on the stock
Citizen MediaWiki skin (no fork). See `docs/superpowers/specs/2026-07-06-black-history-wiki-skin-design.md`
for the design and `docs/superpowers/plans/2026-07-06-black-history-wiki-skin-plan.md`
for the build plan.

## Deploying

1. Install MediaWiki + the Citizen skin (unmodified) per
   https://www.mediawiki.org/wiki/Skin:Citizen#Installation.
2. Paste the contents of `src/citizen-theme.css` into `MediaWiki:Citizen.css` on the wiki.
3. Paste the contents of `src/discovery-rail.bootstrap.js` into `MediaWiki:Citizen.js`.
4. Paste `src/Citizen-preferences.json` into `MediaWiki:Citizen-preferences.json`.
5. Add the snippet in `LocalSettings-snippet.php` to your `LocalSettings.php`.
6. Create the wikitext templates in `src/templates/` as on-wiki `Template:` pages.

## Running tests

`node --test tests/` (no npm install required — uses Node's built-in test runner).
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js README.md
git commit -m "feat: scaffold repo and add heritage-archival palette CSS"
```

---

### Task 2: Typography CSS

**Files:**
- Modify: `src/citizen-theme.css`
- Modify: `tests/citizen-theme.test.js`

**Interfaces:**
- Consumes: `src/citizen-theme.css` from Task 1 (appends to the same `:root` block —
  do not create a second `:root` selector; add properties to the existing one).
- Produces: `--font-family-citizen-serif` and `--font-family-citizen-base` overrides,
  plus a metric-matched fallback face `Source-Serif-fallback` /
  `Source-Sans-fallback`, for later tasks to reference in heading/body rules.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('overrides Citizen font-family variables with the archival type system', () => {
  assert.match(css, /--font-family-citizen-serif:\s*'Source Serif 4'/);
  assert.match(css, /--font-family-citizen-base:\s*'Source Sans 3'/);
});

test('imports the chosen Google Fonts with a full weight range', () => {
  assert.match(css, /fonts\.googleapis\.com\/css2\?family=Source\+Serif\+4/);
  assert.match(css, /fonts\.googleapis\.com\/css2\?family=Source\+Sans\+3/);
});

test('ships a metric-matched fallback face to avoid font-flicker layout shift', () => {
  assert.match(css, /@font-face\s*{\s*font-family:\s*'Source-Sans-fallback'/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (3 new failures — properties/imports not present yet)

- [ ] **Step 3: Add the typography CSS**

```css
/* Append to src/citizen-theme.css, ABOVE the existing :root block */

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
```

Then add these two lines inside the existing `:root { ... }` block from Task 1:

```css
	--font-family-citizen-serif: 'Source Serif 4';
	--font-family-citizen-base: 'Source Sans 3', 'Source-Sans-fallback';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add archival typography (Source Serif 4 / Source Sans 3)"
```

---

### Task 3: Paper-grain texture, performance-mode gated

**Files:**
- Modify: `src/citizen-theme.css`
- Modify: `tests/citizen-theme.test.js`

**Interfaces:**
- Consumes: `--color-surface-0` (Citizen token, now warm-tinted per Task 1) as the
  texture's base layer.
- Produces: `.bhf-texture-parchment` utility class, applied to the content area in
  Task 4.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('gates the paper-grain texture behind performance-mode-off', () => {
  assert.match(
    css,
    /\.citizen-feature-performance-mode-clientpref-0\s+\.bhf-texture-parchment/
  );
});

test('paper-grain texture is a low-opacity SVG noise background', () => {
  assert.match(css, /\.bhf-texture-parchment\s*{[^}]*background-image:\s*url\(/s);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (2 new failures)

- [ ] **Step 3: Add the texture CSS**

```css
/* Append to src/citizen-theme.css */

/* Subtle paper-grain texture — inline SVG fractal noise, no external asset.
 * Only applied when performance mode is off (heavy per-pixel filter cost on
 * weak devices); .bhf-texture-parchment alone (without the gate) is a plain
 * flat surface-0 background. */
.bhf-texture-parchment {
	background-color: var( --color-surface-0 );
}

.citizen-feature-performance-mode-clientpref-0 .bhf-texture-parchment {
	background-image: url( "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E" );
	background-repeat: repeat;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add performance-mode-gated paper-grain texture"
```

---

### Task 4: Homepage layout CSS + Main Page wikitext template

**Files:**
- Modify: `src/citizen-theme.css`
- Create: `src/templates/MainPage.wikitext`
- Modify: `tests/citizen-theme.test.js`

**Interfaces:**
- Consumes: `.bhf-texture-parchment` (Task 3), `--bhf-color-accent-gold` /
  `--bhf-color-text-on-gold` (Task 1).
- Produces: CSS classes `.bhf-masthead`, `.bhf-hero`, `.bhf-category-strip`,
  `.bhf-category-tile` — consumed by `MainPage.wikitext` in this task, and by the
  discovery rail markup in Task 5.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines homepage layout classes', () => {
  for (const cls of ['.bhf-masthead', '.bhf-hero', '.bhf-category-strip', '.bhf-category-tile']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('category tiles use the gold-filled-chip contrast pattern, not gold text', () => {
  const tileBlock = css.match(/\.bhf-category-tile\s*{[^}]*}/s)[0];
  assert.match(tileBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(tileBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (2 new failures)

- [ ] **Step 3: Add the homepage CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-masthead {
	text-align: center;
	padding: 2rem 1rem;
	font-family: var( --font-family-citizen-serif );
}

.bhf-masthead__tagline {
	color: var( --color-subtle );
	font-style: italic;
}

.bhf-hero {
	display: flex;
	gap: 1.5rem;
	align-items: center;
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
	border-radius: 8px;
	padding: 1.5rem;
	margin-block: 1.5rem;
}

.bhf-hero img {
	max-width: 40%;
	border-radius: 6px;
}

.bhf-hero__title {
	font-family: var( --font-family-citizen-serif );
	font-size: 1.5rem;
}

.bhf-category-strip {
	display: grid;
	grid-template-columns: repeat( auto-fit, minmax( 140px, 1fr ) );
	gap: 1rem;
	margin-block: 1.5rem;
}

.bhf-category-tile {
	background-color: var( --bhf-color-accent-gold );
	color: var( --bhf-color-text-on-gold );
	text-align: center;
	padding: 1rem;
	border-radius: 6px;
	font-weight: 600;
	text-decoration: none;
	display: block;
}

.bhf-category-tile:hover {
	filter: brightness( 1.08 );
}

@media ( max-width: 640px ) {
	.bhf-hero {
		flex-direction: column;
	}

	.bhf-hero img {
		max-width: 100%;
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the Main Page wikitext template**

```wikitext
<!-- src/templates/MainPage.wikitext — paste as the wiki's Main Page content -->
<div class="bhf-masthead bhf-texture-parchment">
'''The Black History Foundation Wiki'''

''Discover. Preserve. Share.''
</div>

<div class="bhf-hero">
[[File:Featured-placeholder.jpg|thumb|none]]
<div>
<span class="bhf-hero__title">{{FEATURED_TITLE}}</span>

{{FEATURED_EXCERPT}}
</div>
</div>

<div id="bhf-discovery-rail"></div>
<!-- populated client-side by discovery-rail.bootstrap.js, see Task 5-7 -->

<div class="bhf-category-strip">
[[:Category:People|<div class="bhf-category-tile">People</div>]]
[[:Category:Places|<div class="bhf-category-tile">Places</div>]]
[[:Category:Events|<div class="bhf-category-tile">Events</div>]]
[[:Category:Eras|<div class="bhf-category-tile">Eras</div>]]
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css src/templates/MainPage.wikitext tests/citizen-theme.test.js
git commit -m "feat: add homepage masthead/hero/category-strip layout"
```

---

### Task 5: Discovery rail — Recently Added (pure logic + tests)

**Files:**
- Create: `src/discovery-rail.js`
- Create: `tests/discovery-rail.test.js`

**Interfaces:**
- Produces: `transformRecentChanges(apiResponse)` → `Array<{ title, timestamp, user, url }>`
  and `renderCard(item)` → HTML string. Both are pure functions with no `mw`/`fetch`
  dependency, exported via `module.exports`, consumed by the bootstrap layer in Task 7.

- [ ] **Step 1: Write the failing test**

```js
// tests/discovery-rail.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { transformRecentChanges, renderCard } = require('../src/discovery-rail.js');

test('transformRecentChanges maps the core API shape to card data', () => {
  const apiResponse = {
    query: {
      recentchanges: [
        { title: 'Robert Renfro', timestamp: '2026-07-01T12:00:00Z', user: 'TKennedy' },
        { title: 'Fort Nashborough', timestamp: '2026-06-28T09:30:00Z', user: 'Contributor2' },
      ],
    },
  };

  const result = transformRecentChanges(apiResponse);

  assert.deepEqual(result, [
    {
      title: 'Robert Renfro',
      timestamp: '2026-07-01T12:00:00Z',
      user: 'TKennedy',
      url: '/wiki/Robert_Renfro',
    },
    {
      title: 'Fort Nashborough',
      timestamp: '2026-06-28T09:30:00Z',
      user: 'Contributor2',
      url: '/wiki/Fort_Nashborough',
    },
  ]);
});

test('transformRecentChanges returns an empty array when the API response has no results', () => {
  assert.deepEqual(transformRecentChanges({ query: { recentchanges: [] } }), []);
});

test('renderCard produces a card with title, contributor, and relative-safe timestamp', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
  });

  assert.match(html, /class="bhf-rail-card"/);
  assert.match(html, /href="\/wiki\/Robert_Renfro"/);
  assert.match(html, />Robert Renfro</);
  assert.match(html, /TKennedy/);
});

test('renderCard escapes HTML in titles and usernames to prevent injection', () => {
  const html = renderCard({
    title: '<script>alert(1)</script>',
    timestamp: '2026-07-01T12:00:00Z',
    user: '<b>x</b>',
    url: '/wiki/Test',
  });

  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>x</b>'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/discovery-rail.test.js`
Expected: FAIL — `../src/discovery-rail.js` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```js
// src/discovery-rail.js

/**
 * Pure transform/render functions for the homepage discovery rail.
 * No `mw` or `fetch` dependency here — see discovery-rail.bootstrap.js for
 * the MediaWiki API wiring. Kept separate so this file is unit-testable
 * with plain Node.
 */

function titleToUrl(title) {
	return '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
}

function escapeHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function transformRecentChanges(apiResponse) {
	const changes = ( apiResponse.query && apiResponse.query.recentchanges ) || [];

	return changes.map( ( change ) => ( {
		title: change.title,
		timestamp: change.timestamp,
		user: change.user,
		url: titleToUrl( change.title ),
	} ) );
}

function renderCard(item) {
	return (
		'<a class="bhf-rail-card" href="' + escapeHtml( item.url ) + '">' +
		'<span class="bhf-rail-card__title">' + escapeHtml( item.title ) + '</span>' +
		'<span class="bhf-rail-card__meta">' + escapeHtml( item.user ) + '</span>' +
		'</a>'
	);
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = { transformRecentChanges, renderCard, titleToUrl, escapeHtml };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/discovery-rail.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/discovery-rail.js tests/discovery-rail.test.js
git commit -m "feat: add Recently Added transform/render logic for discovery rail"
```

---

### Task 6: Discovery rail — Trending (graceful degradation)

**Files:**
- Modify: `src/discovery-rail.js`
- Modify: `tests/discovery-rail.test.js`

**Interfaces:**
- Consumes: `titleToUrl`, `escapeHtml`, `renderCard` from Task 5 (same file, same
  exports — do not duplicate).
- Produces: `transformMostViewed(apiResponse)` → `Array<{ title, views, url }> | null`
  (returns `null`, not `[]`, when the PageViewInfo API module is absent — the bootstrap
  layer in Task 7 uses this to distinguish "no data" from "feature unavailable, hide
  the column").

- [ ] **Step 1: Write the failing test**

```js
// append to tests/discovery-rail.test.js
const { transformMostViewed, isPageViewInfoUnavailable } = require('../src/discovery-rail.js');

test('transformMostViewed maps the PageViewInfo API shape to card data', () => {
  const apiResponse = {
    query: {
      mostviewed: [
        { title: 'Robert Renfro', count: 482 },
        { title: 'Fort Nashborough', count: 210 },
      ],
    },
  };

  assert.deepEqual(transformMostViewed(apiResponse), [
    { title: 'Robert Renfro', views: 482, url: '/wiki/Robert_Renfro' },
    { title: 'Fort Nashborough', views: 210, url: '/wiki/Fort_Nashborough' },
  ]);
});

test('transformMostViewed returns null when the mostviewed list is absent (extension not installed)', () => {
  assert.equal(transformMostViewed({ query: {} }), null);
});

test('isPageViewInfoUnavailable detects the unknown_action API error', () => {
  assert.equal(
    isPageViewInfoUnavailable({ error: { code: 'unknown_action' } }),
    true
  );
  assert.equal(
    isPageViewInfoUnavailable({ error: { code: 'some_other_error' } }),
    false
  );
  assert.equal(isPageViewInfoUnavailable({ query: {} }), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/discovery-rail.test.js`
Expected: FAIL — `transformMostViewed` and `isPageViewInfoUnavailable` not exported yet.

- [ ] **Step 3: Add the implementation**

```js
// Append to src/discovery-rail.js, before the module.exports line

function transformMostViewed(apiResponse) {
	const rows = apiResponse.query && apiResponse.query.mostviewed;

	if ( !rows ) {
		return null;
	}

	return rows.map( ( row ) => ( {
		title: row.title,
		views: row.count,
		url: titleToUrl( row.title ),
	} ) );
}

function isPageViewInfoUnavailable(apiResponse) {
	return Boolean( apiResponse.error && apiResponse.error.code === 'unknown_action' );
}
```

Update the guarded `module.exports` block to:

```js
if ( typeof module !== 'undefined' ) {
	module.exports = {
		transformRecentChanges,
		renderCard,
		titleToUrl,
		escapeHtml,
		transformMostViewed,
		isPageViewInfoUnavailable,
	};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/discovery-rail.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/discovery-rail.js tests/discovery-rail.test.js
git commit -m "feat: add Trending transform logic with graceful degradation"
```

---

### Task 7: mw.Api bootstrap wiring (MediaWiki:Citizen.js)

**Files:**
- Create: `src/discovery-rail.bootstrap.js`

**Interfaces:**
- Consumes: `transformRecentChanges`, `transformMostViewed`, `isPageViewInfoUnavailable`,
  `renderCard` from `src/discovery-rail.js` (Tasks 5–6).
- Produces: the script pasted into `MediaWiki:Citizen.js`. Not unit-tested here — it
  requires the `mw` global that only exists inside a real MediaWiki page — Task 10's
  manual smoke test is what exercises this file.

- [ ] **Step 1: Write the bootstrap script**

```js
// src/discovery-rail.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js.
// Depends on transformRecentChanges/transformMostViewed/isPageViewInfoUnavailable/
// renderCard, which must ALSO be pasted in above this block (MediaWiki:Citizen.js is
// a single flat script — there is no require()/import here). discovery-rail.js's
// guarded `if (typeof module !== 'undefined')` export block makes it safe to paste
// verbatim, unmodified, ahead of this file.

( function () {
	'use strict';

	function mountRail() {
		var container = document.getElementById( 'bhf-discovery-rail' );

		if ( !container ) {
			return;
		}

		container.innerHTML =
			'<div class="bhf-rail">' +
			'<section class="bhf-rail__column">' +
			'<h2>Recently Added</h2>' +
			'<div id="bhf-rail-recent" class="bhf-rail__cards"></div>' +
			'</section>' +
			'<section id="bhf-rail-trending-section" class="bhf-rail__column">' +
			'<h2>Trending</h2>' +
			'<div id="bhf-rail-trending" class="bhf-rail__cards"></div>' +
			'</section>' +
			'</div>';

		var api = new mw.Api();

		api.get( {
			action: 'query',
			list: 'recentchanges',
			rcnamespace: 0,
			rctype: 'new',
			rclimit: 10,
			rcprop: 'title|timestamp|user'
		} ).done( function ( data ) {
			var items = transformRecentChanges( data );
			document.getElementById( 'bhf-rail-recent' ).innerHTML =
				items.map( renderCard ).join( '' );
		} );

		api.get( {
			action: 'query',
			list: 'mostviewed',
			pvimlimit: 10
		} ).done( function ( data ) {
			var items = transformMostViewed( data );

			if ( items === null ) {
				document.getElementById( 'bhf-rail-trending-section' ).style.display = 'none';
				return;
			}

			document.getElementById( 'bhf-rail-trending' ).innerHTML = items
				.map( function ( item ) {
					return renderCard( {
						title: item.title,
						user: item.views + ' views',
						url: item.url
					} );
				} )
				.join( '' );
		} ).fail( function ( code, data ) {
			if ( isPageViewInfoUnavailable( data ) ) {
				document.getElementById( 'bhf-rail-trending-section' ).style.display = 'none';
			}
		} );
	}

	mw.loader.using( 'mediawiki.api' ).then( function () {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', mountRail );
		} else {
			mountRail();
		}
	} );
}() );
```

- [ ] **Step 2: Manual verification note**

This file has no automated test — it needs the `mw` global. Task 10's local
MediaWiki + Citizen smoke test loads this script for real and confirms both rail
columns populate, and that the Trending column hides itself cleanly when
PageViewInfo is not installed.

- [ ] **Step 3: Commit**

```bash
git add src/discovery-rail.bootstrap.js
git commit -m "feat: add mw.Api bootstrap wiring for the discovery rail"
```

---

### Task 8: Article components — infobox, pull-quote, verified badge

**Files:**
- Modify: `src/citizen-theme.css`
- Modify: `tests/citizen-theme.test.js`
- Create: `src/templates/Infobox.wikitext`
- Create: `src/templates/Quote.wikitext`
- Create: `src/templates/ArticleBreadcrumb.wikitext`
- Create: `src/templates/RelatedPages.wikitext`

**Interfaces:**
- Consumes: `--bhf-color-accent-gold` / `--bhf-color-text-on-gold` (Task 1),
  `--bhf-color-success` (Task 1), `--font-family-citizen-serif` (Task 2).
- Produces: `.bhf-infobox`, `.bhf-infobox--person` / `--place` / `--event`,
  `.bhf-pullquote`, `.bhf-badge--verified`, `.bhf-breadcrumb`, `.bhf-related-pages`
  CSS classes, consumed by the wikitext templates in this task.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the shared infobox shell and per-type variants', () => {
  for (const cls of ['.bhf-infobox', '.bhf-infobox--person', '.bhf-infobox--place', '.bhf-infobox--event']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('pull-quote uses gold left-border with italic serif text', () => {
  const block = css.match(/\.bhf-pullquote\s*{[^}]*}/s)[0];
  assert.match(block, /border-left:.*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(block, /font-style:\s*italic/);
  assert.match(block, /font-family:\s*var\(\s*--font-family-citizen-serif\s*\)/);
});

test('verified badge uses gold-fill contrast pattern, and success badge uses the green token', () => {
  const badgeBlock = css.match(/\.bhf-badge--verified\s*{[^}]*}/s)[0];
  assert.match(badgeBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(badgeBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);
});

test('defines the breadcrumb category tags and related-pages sidebar block', () => {
  for (const cls of ['.bhf-breadcrumb', '.bhf-related-pages']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (3 new failures)

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-infobox {
	float: right;
	width: 280px;
	margin: 0 0 1rem 1rem;
	background-color: var( --color-surface-1 );
	border: 1px solid var( --bhf-color-accent-gold );
	border-radius: 6px;
	padding: 0.75rem;
}

.bhf-infobox__title {
	font-family: var( --font-family-citizen-serif );
	font-weight: 700;
	text-align: center;
	border-bottom: 2px solid var( --bhf-color-accent-gold );
	padding-bottom: 0.5rem;
	margin-bottom: 0.5rem;
}

.bhf-infobox--person .bhf-infobox__type-label::before {
	content: "Person";
}

.bhf-infobox--place .bhf-infobox__type-label::before {
	content: "Place";
}

.bhf-infobox--event .bhf-infobox__type-label::before {
	content: "Event";
}

.bhf-infobox__type-label {
	display: block;
	text-align: center;
	text-transform: uppercase;
	font-size: 0.7rem;
	letter-spacing: 0.05em;
	color: var( --color-subtle );
}

@media ( max-width: 640px ) {
	.bhf-infobox {
		float: none;
		width: auto;
		margin: 0 0 1rem 0;
	}
}

.bhf-pullquote {
	border-left: 4px solid var( --bhf-color-accent-gold );
	font-family: var( --font-family-citizen-serif );
	font-style: italic;
	padding: 0.5rem 0 0.5rem 1rem;
	margin: 1.5rem 0;
	color: var( --color-emphasized );
}

.bhf-badge--verified {
	display: inline-block;
	background-color: var( --bhf-color-accent-gold );
	color: var( --bhf-color-text-on-gold );
	border-radius: 999px;
	padding: 0.15rem 0.6rem;
	font-size: 0.75rem;
	font-weight: 600;
}

.bhf-breadcrumb {
	display: block;
	color: var( --color-subtle );
	font-size: 0.85rem;
	margin-top: -0.5rem;
	margin-bottom: 1rem;
}

.bhf-breadcrumb a {
	color: inherit;
}

.bhf-related-pages {
	clear: both;
	border-top: 1px solid var( --border-color-base );
	margin-top: 2rem;
	padding-top: 0.75rem;
	font-size: 0.9rem;
}

.bhf-related-pages__title {
	font-weight: 700;
	display: block;
	margin-bottom: 0.25rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the wikitext templates**

```wikitext
<!-- src/templates/Infobox.wikitext — paste as Template:Infobox
    Usage: {{Infobox|type=person|title=Robert Renfro|...}} -->
<div class="bhf-infobox bhf-infobox--{{{type|person}}}">
<div class="bhf-infobox__type-label"></div>
<div class="bhf-infobox__title">{{{title}}}</div>
[[File:{{{image|Placeholder-portrait.jpg}}}|center|200px]]
{{{body}}}
</div>
```

```wikitext
<!-- src/templates/Quote.wikitext — paste as Template:Quote
    Usage: {{Quote|text=...|attribution=...}} -->
<div class="bhf-pullquote">
{{{text}}}
{{#if:{{{attribution|}}}|<div class="bhf-pullquote__attribution">— {{{attribution}}}</div>}}
</div>
```

```wikitext
<!-- src/templates/ArticleBreadcrumb.wikitext — paste as Template:ArticleBreadcrumb
    Usage directly under the article title: {{ArticleBreadcrumb|type=Person|era=18th Century|place=Nashville}} -->
<div class="bhf-breadcrumb">{{{type}}} &middot; {{{era}}} &middot; {{{place}}}{{#if:{{{verified|}}}|<span class="bhf-badge--verified">Sources verified</span>}}</div>
```

```wikitext
<!-- src/templates/RelatedPages.wikitext — paste as Template:RelatedPages
    Usage: {{RelatedPages|era=Template:Era18th|links=[[Fort Nashborough]], [[James Robertson]]}} -->
<div class="bhf-related-pages">
<span class="bhf-related-pages__title">Related pages</span>
{{{links}}}

Part of timeline: [[{{{era}}}|{{PAGENAME:{{{era}}}}}]]
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/Infobox.wikitext src/templates/Quote.wikitext src/templates/ArticleBreadcrumb.wikitext src/templates/RelatedPages.wikitext
git commit -m "feat: add infobox, pull-quote, badge, breadcrumb, and related-pages components"
```

---

### Task 9: Contribute-prompt components (homepage footer band + article footer)

**Files:**
- Modify: `src/citizen-theme.css`
- Modify: `tests/citizen-theme.test.js`
- Modify: `src/templates/MainPage.wikitext`
- Create: `src/templates/ContributeFooter.wikitext`

**Interfaces:**
- Consumes: `--bhf-color-accent-terracotta` (Task 1), `--color-surface-1` (Citizen
  token).
- Produces: `.bhf-footer-band` (homepage community CTA + link columns) and
  `.bhf-contribute-prompt` (article talk-page prompt), consumed by
  `MainPage.wikitext` and by `Template:ContributeFooter` respectively.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the homepage community footer band and article contribute prompt', () => {
  for (const cls of ['.bhf-footer-band', '.bhf-contribute-prompt']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('contribute prompt uses the terracotta accent, not gold, for its border', () => {
  const block = css.match(/\.bhf-contribute-prompt\s*{[^}]*}/s)[0];
  assert.match(block, /border:.*var\(\s*--bhf-color-accent-terracotta\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (2 new failures)

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-footer-band {
	background-color: var( --color-surface-1 );
	padding: 2rem 1rem;
	margin-top: 2rem;
	display: flex;
	flex-wrap: wrap;
	gap: 2rem;
	justify-content: space-between;
}

.bhf-footer-band__cta {
	font-family: var( --font-family-citizen-serif );
	font-size: 1.1rem;
}

.bhf-footer-band__links {
	display: flex;
	gap: 2rem;
	flex-wrap: wrap;
}

.bhf-contribute-prompt {
	border: 1px dashed var( --bhf-color-accent-terracotta );
	border-radius: 6px;
	padding: 0.75rem 1rem;
	margin-top: 2rem;
	font-style: italic;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the wikitext**

```wikitext
<!-- src/templates/ContributeFooter.wikitext — paste as Template:ContributeFooter,
    then transclude with {{ContributeFooter}} at the bottom of article templates
    or via a per-namespace default (see MediaWiki:Newarticletext for an alternative
    hook point). -->
<div class="bhf-contribute-prompt">
Know more about this? [{{fullurl:{{FULLPAGENAME}}|action=edit}} Add to this page] or visit the [[Talk:{{FULLPAGENAME}}|discussion page]].
</div>
```

Append this footer band to the end of `src/templates/MainPage.wikitext`:

```wikitext
<div class="bhf-footer-band">
<div class="bhf-footer-band__cta">
'''Have a story to share?''' [[Special:Contribute|Add your family's history]] to the archive.
</div>
<div class="bhf-footer-band__links">
'''About Us'''

[[About]] &middot; [[Contact]]

'''Get Involved'''

[https://www.tbhfdn.org/donate Donate] &middot; [[Special:Contribute|Contribute]]
</div>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/MainPage.wikitext src/templates/ContributeFooter.wikitext
git commit -m "feat: add homepage footer band and article contribute-prompt components"
```

---

### Task 10: Force light theme + LocalSettings snippet

**Files:**
- Create: `src/Citizen-preferences.json`
- Create: `LocalSettings-snippet.php`
- Create: `tests/config.test.js`

**Interfaces:**
- Produces: the two on-wiki/config files referenced by the README's deploy steps
  (Task 1, Step 5).

- [ ] **Step 1: Write the failing test**

```js
// tests/config.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Citizen-preferences.json removes the theme picker', () => {
  const json = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'src', 'Citizen-preferences.json'), 'utf8')
  );
  assert.equal(json.preferences['skin-theme'], null);
});

test('LocalSettings snippet forces the light theme and sets a logo placeholder to fill in', () => {
  const php = fs.readFileSync(
    path.join(__dirname, '..', 'LocalSettings-snippet.php'),
    'utf8'
  );
  assert.match(php, /\$wgCitizenThemeDefault\s*=\s*'light'/);
  assert.match(php, /\$wgLogos\s*=\s*\[/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/config.test.js`
Expected: FAIL — both files missing.

- [ ] **Step 3: Write the config files**

```json
{
  "preferences": {
    "skin-theme": null,
    "citizen-feature-pure-black": null
  }
}
```

```php
<?php
// LocalSettings-snippet.php — append to your wiki's LocalSettings.php.
// Requires the logo image files to exist at the paths below; supply your
// own tbhfdn.org-branded assets (this repo does not include image assets).

$wgCitizenThemeDefault = 'light';

$wgLogos = [
	'1x' => '$wgResourceBasePath/resources/assets/tbhfdn-wordmark.svg',
	'icon' => '$wgResourceBasePath/resources/assets/tbhfdn-icon.svg',
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/config.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/Citizen-preferences.json LocalSettings-snippet.php tests/config.test.js
git commit -m "feat: force light theme and add LocalSettings config snippet"
```

---

### Task 11: Local MediaWiki + Citizen smoke test

**Files:**
- Create: `docker-compose.yml`
- Create: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1–10 (this task deploys and visually verifies
  all of them together for the first time).

- [ ] **Step 1: Write the Docker Compose file**

```yaml
# docker-compose.yml — local MediaWiki + Citizen for manual verification only.
# Not part of the deployable theme; delete or ignore in production.
services:
  mediawiki:
    image: mediawiki:1.43
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - mediawiki-data:/var/www/html/images
      - ./vendor-citizen-reference:/var/www/html/skins/Citizen:ro
    depends_on:
      - db
  db:
    image: mariadb:10.11
    restart: unless-stopped
    environment:
      MARIADB_DATABASE: mediawiki
      MARIADB_USER: mediawiki
      MARIADB_PASSWORD: mediawiki
      MARIADB_ROOT_PASSWORD: rootpass
    volumes:
      - db-data:/var/lib/mysql
volumes:
  mediawiki-data:
  db-data:
```

- [ ] **Step 2: Bring the stack up and complete the MediaWiki web installer**

Run: `docker compose up -d`
Expected: both containers report `Up`. Then visit `http://localhost:8080` and
complete the installer, selecting Citizen as the skin (already mounted read-only
from `vendor-citizen-reference/`, cloned during planning).

- [ ] **Step 3: Apply the theme**

Manually, in the running wiki's admin UI:
1. Paste `src/citizen-theme.css` into `MediaWiki:Citizen.css`.
2. Paste `src/discovery-rail.js` contents followed by `src/discovery-rail.bootstrap.js`
   contents into `MediaWiki:Citizen.js` (in that order — the bootstrap calls the
   pure functions defined above it).
3. Paste `src/Citizen-preferences.json` into `MediaWiki:Citizen-preferences.json`.
4. Add `LocalSettings-snippet.php`'s contents to the container's `LocalSettings.php`
   (skip the `$wgLogos` line, or point it at a placeholder image, since no logo asset
   exists yet).
5. Create `Template:Infobox`, `Template:Quote`, `Template:ContributeFooter`,
   `Template:ArticleBreadcrumb`, and `Template:RelatedPages` from `src/templates/`.
6. Set the Main Page content from `src/templates/MainPage.wikitext` (now includes the
   footer band from Task 9).
7. Create `Category:People`, `Category:Places`, `Category:Events`, `Category:Eras`
   and at least one test article in each, using `{{Infobox}}`, `{{Quote}}`,
   `{{ArticleBreadcrumb}}`, `{{RelatedPages}}`, and `{{ContributeFooter}}`.

- [ ] **Step 4: Run the smoke-test checklist**

```markdown
# Smoke test checklist

- [ ] Main Page loads with parchment background and paper-grain texture visible
- [ ] Headings render in Source Serif 4, body text in Source Sans 3, no visible
      font-flicker/layout shift on load
- [ ] Category tiles show espresso text on a gold background (not gold text)
- [ ] Discovery rail's "Recently Added" column populates with the test articles
- [ ] Discovery rail's "Trending" column is HIDDEN (PageViewInfo is not installed
      in this local stack) — confirms graceful degradation
- [ ] A Person-type infobox, Place-type infobox, and Event-type infobox each render
      with the correct type label and shared gold-bordered shell
- [ ] A pull-quote renders with gold left-border and italic serif text
- [ ] The homepage footer band shows the contribute CTA and About/Get-Involved link
      columns
- [ ] A test article shows the dashed terracotta-bordered "Know more about this?"
      contribute prompt
- [ ] A test article shows the breadcrumb category tags under its title, and (when
      `verified=1` is passed) the gold "Sources verified" badge inline with them
- [ ] A test article shows the "Related pages"/"Part of timeline" block below the
      infobox
- [ ] The theme preferences panel has NO theme picker (forced light theme)
- [ ] Resizing the browser to a mobile width collapses the hero to a single column
      and the infobox to full-width, non-floated
- [ ] Browser console shows no JS errors on the Main Page or an article page
```

Expected: every box above is checked by manual inspection in the browser at
`http://localhost:8080`.

- [ ] **Step 5: Tear down**

Run: `docker compose down`

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: add local MediaWiki+Citizen smoke test stack and checklist"
```

---

## Post-plan follow-ups (not part of this plan)

- Supply real tbhfdn.org-branded logo assets for `$wgLogos` (Task 9 ships a
  placeholder path only).
- Install PageViewInfo on the production wiki if the Trending module is wanted live
  (Task 6/7 already handle its absence gracefully; this is a deployment decision, not
  a code task).
- Contributor profiles, source-citation tooling, submission workflows, and dark mode
  remain explicitly out of scope per the spec's "Open Items" section.
