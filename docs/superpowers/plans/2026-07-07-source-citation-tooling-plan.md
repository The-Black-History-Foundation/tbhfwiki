# Source-Citation / Verified-Sources Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the base theme's cosmetic, manually-flagged "Sources verified" badge
with a structured `Template:Citation` and two automatically-computed badges (gold
"Sources cited," green "Reviewer confirmed") driven by real page content instead of a
flag that can drift.

**Architecture:** Follows the exact pattern already established by the base theme's
discovery rail: pure, unit-testable JS functions in one file
(`src/citation-badges.js`) separated from a thin, browser-only `mw`/DOM bootstrap
(`src/citation-badges.bootstrap.js`) that gets pasted onto the same
`MediaWiki:Citizen.js` page. CSS lives in the same shared `src/citizen-theme.css` the
base theme already uses. No new MediaWiki extension, no new backend.

**Tech Stack:** Plain CSS (custom properties, reusing base-theme tokens), vanilla JS
(CommonJS-guarded exports, browser globals only in the bootstrap layer), Node's
built-in test runner (`node:test` + `node:assert/strict`, Node 24 — no npm
dependencies), MediaWiki wikitext with ParserFunctions (`{{#if:}}`, `{{#switch:}}` —
already relied on by the base theme's existing templates).

## Global Constraints

- No new MediaWiki extension and no new backend — CSS/JS/wikitext only, same as the
  base theme.
- Citation fields: `title` (required), `author` (optional), `type` (required, one of
  `archival`, `newspaper`, `book`, `oral-history`, `record`, `photo`), `publication`
  (optional), `date` (optional), `location` (optional), `confidence` (required, one of
  `verified`, `single-source`, `disputed`).
- Citations live in a standalone `== Sources ==` section via `{{Citation|...}}` —
  never inside `<ref>`/`<references/>`.
- Gold "Sources cited" badge = page has ≥1 `.bhf-citation` element. Green "Reviewer
  confirmed" badge = page's category links include `Category:Reviewed`. The two
  badges are fully independent of each other and of individual citation confidence
  values — a `disputed` citation never suppresses the gold badge.
- No new colors: reuse `--bhf-color-accent-gold` / `--bhf-color-text-on-gold` (gold
  badge, already built), `--bhf-color-success` (green badge — defined in the base
  theme but previously unused), `--bhf-color-accent-terracotta` (disputed tag),
  `--color-subtle` (single-source tag and type labels).
- Verified WCAG AA contrast pairs (computed during the base theme project, reused
  here unchanged): parchment (`--color-surface-0`, `#F4EDE1`) text on
  `--bhf-color-success` (`#3B5C40`) background = 6.47:1, passes AA. Forest green text
  on parchment = 6.47:1, passes AA. Terracotta text on parchment = 4.97:1, passes AA.
- Pure JS functions (`countCitations`, `hasReviewedCategory`, `buildBadgeHtml`) must
  never touch `document`/`mw`/`fetch` directly — only the bootstrap file does DOM
  access, mirroring `discovery-rail.js`/`discovery-rail.bootstrap.js`'s split.
- The old `ArticleBreadcrumb` `verified` parameter is removed from the template logic
  entirely (not read anywhere) — pages that still pass `verified=1` are unaffected;
  MediaWiki silently ignores unused named template parameters.

---

### Task 1: Citation card CSS + `Template:Citation`

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Create: `src/templates/Citation.wikitext`

**Interfaces:**
- Produces: `.bhf-citation`, `.bhf-citation--archival`/`--newspaper`/`--book`/
  `--oral-history`/`--record`/`--photo`, `.bhf-citation__type`, `.bhf-citation__title`,
  `.bhf-citation__meta`, `.bhf-citation__confidence`,
  `.bhf-citation__confidence--verified`/`--single-source`/`--disputed` CSS classes,
  consumed by `Template:Citation` in this task and by later tasks' tests (Task 2's
  detection functions count `.bhf-citation` elements, though the class name is the
  only thing they depend on — not this task's CSS rules).

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the citation card shell and all six type variants', () => {
  for (const cls of [
    '.bhf-citation', '.bhf-citation--archival', '.bhf-citation--newspaper',
    '.bhf-citation--book', '.bhf-citation--oral-history', '.bhf-citation--record',
    '.bhf-citation--photo'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('citation type variants set a distinct label via ::before content', () => {
  assert.match(css, /\.bhf-citation--archival \.bhf-citation__type::before\s*{\s*content:\s*"Archival Document"/);
  assert.match(css, /\.bhf-citation--oral-history \.bhf-citation__type::before\s*{\s*content:\s*"Oral History"/);
});

test('confidence tags use the established palette tokens, not new colors', () => {
  const verifiedBlock = css.match(/\.bhf-citation__confidence--verified\s*{[^}]*}/s)[0];
  assert.match(verifiedBlock, /color:\s*var\(\s*--bhf-color-success\s*\)/);

  const singleSourceBlock = css.match(/\.bhf-citation__confidence--single-source\s*{[^}]*}/s)[0];
  assert.match(singleSourceBlock, /color:\s*var\(\s*--color-subtle\s*\)/);

  const disputedBlock = css.match(/\.bhf-citation__confidence--disputed\s*{[^}]*}/s)[0];
  assert.match(disputedBlock, /color:\s*var\(\s*--bhf-color-accent-terracotta\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (3 new failures — classes/rules not defined yet)

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-citation {
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
	border-radius: 6px;
	padding: 0.75rem 1rem;
	margin-bottom: 0.5rem;
}

.bhf-citation__type {
	display: inline-block;
	text-transform: uppercase;
	font-size: 0.7rem;
	letter-spacing: 0.03em;
	color: var( --color-subtle );
	margin-right: 0.5rem;
}

.bhf-citation--archival .bhf-citation__type::before {
	content: "Archival Document";
}

.bhf-citation--newspaper .bhf-citation__type::before {
	content: "Newspaper";
}

.bhf-citation--book .bhf-citation__type::before {
	content: "Book";
}

.bhf-citation--oral-history .bhf-citation__type::before {
	content: "Oral History";
}

.bhf-citation--record .bhf-citation__type::before {
	content: "Government Record";
}

.bhf-citation--photo .bhf-citation__type::before {
	content: "Photograph/Artifact";
}

.bhf-citation__title {
	font-weight: 600;
}

.bhf-citation__meta {
	display: block;
	font-size: 0.85rem;
	color: var( --color-subtle );
	margin-top: 0.15rem;
}

.bhf-citation__confidence {
	display: inline-block;
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.03em;
	padding: 0.1rem 0.5rem;
	border-radius: 999px;
	border: 1px solid currentColor;
	margin-top: 0.3rem;
}

.bhf-citation__confidence--verified {
	color: var( --bhf-color-success );
}

.bhf-citation__confidence--single-source {
	color: var( --color-subtle );
}

.bhf-citation__confidence--disputed {
	color: var( --bhf-color-accent-terracotta );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the Citation template**

```wikitext
<!-- src/templates/Citation.wikitext — paste as Template:Citation
    Usage: {{Citation|title=Deed of manumission|type=archival|date=1779|location=Davidson County Register's Office|confidence=verified}}
    Required: title, type (archival|newspaper|book|oral-history|record|photo), confidence (verified|single-source|disputed)
    Optional: author, publication, date, location -->
<div class="bhf-citation bhf-citation--{{{type}}}" data-confidence="{{{confidence}}}">
<span class="bhf-citation__type"></span><span class="bhf-citation__title">{{{title}}}</span>{{#if:{{{author|}}}| — {{{author}}}}}
<span class="bhf-citation__meta">{{{publication|}}}{{#if:{{{date|}}}| &middot; {{{date}}}}}{{#if:{{{location|}}}| &middot; {{{location}}}}}</span>
<span class="bhf-citation__confidence bhf-citation__confidence--{{{confidence}}}">{{#switch:{{{confidence}}}|verified=Verified|single-source=Single source|disputed=Disputed|#default={{{confidence}}}}}</span>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/Citation.wikitext
git commit -m "feat: add citation card CSS and Template:Citation"
```

---

### Task 2: Citation-detection pure functions

**Files:**
- Create: `src/citation-badges.js`
- Create: `tests/citation-badges.test.js`

**Interfaces:**
- Produces: `countCitations(citationElements)` → number, `hasReviewedCategory(categoryLinkTitles)`
  → boolean. Both pure, no `document`/`mw`/`fetch` dependency, exported via a guarded
  `module.exports` (same pattern as `src/discovery-rail.js`). Consumed by Task 3
  (which adds `buildBadgeHtml` to the same file/exports) and Task 4's bootstrap.

- [ ] **Step 1: Write the failing test**

```js
// tests/citation-badges.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { countCitations, hasReviewedCategory } = require('../src/citation-badges.js');

test('countCitations returns the number of citation elements', () => {
  assert.equal(countCitations([{}, {}, {}]), 3);
});

test('countCitations returns 0 for an empty list', () => {
  assert.equal(countCitations([]), 0);
});

test('hasReviewedCategory returns true when a title contains Category:Reviewed', () => {
  assert.equal(
    hasReviewedCategory(['Category:People', 'Category:Reviewed']),
    true
  );
});

test('hasReviewedCategory returns false when no title matches', () => {
  assert.equal(
    hasReviewedCategory(['Category:People', 'Category:Places']),
    false
  );
});

test('hasReviewedCategory returns false for an empty list', () => {
  assert.equal(hasReviewedCategory([]), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citation-badges.test.js`
Expected: FAIL — `../src/citation-badges.js` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```js
// src/citation-badges.js
//
// Pure functions for computing the two article-level badges (gold "Sources
// cited," green "Reviewer confirmed"). No `document`/`mw`/`fetch` here — see
// citation-badges.bootstrap.js for the DOM wiring. Kept separate so this file
// is unit-testable with plain Node, mirroring discovery-rail.js's split.

function countCitations(citationElements) {
	return citationElements.length;
}

function hasReviewedCategory(categoryLinkTitles) {
	return categoryLinkTitles.some( function ( title ) {
		return title.indexOf( 'Category:Reviewed' ) !== -1;
	} );
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = { countCitations, hasReviewedCategory };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citation-badges.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/citation-badges.js tests/citation-badges.test.js
git commit -m "feat: add citation-count and reviewed-category detection functions"
```

---

### Task 3: Badge HTML builder + green "Reviewer confirmed" badge CSS

**Files:**
- Modify: `src/citation-badges.js`
- Modify: `tests/citation-badges.test.js`
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)

**Interfaces:**
- Consumes: `countCitations`, `hasReviewedCategory` from Task 2 (same file, same
  guarded exports — extend, don't duplicate, the `module.exports` block).
- Produces: `buildBadgeHtml({ hasSources, isReviewed })` → HTML string. Consumed by
  Task 4's bootstrap. Also produces `.bhf-badge--reviewed` CSS class.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citation-badges.test.js
const { buildBadgeHtml } = require('../src/citation-badges.js');

test('buildBadgeHtml returns both badges when sourced and reviewed', () => {
  const html = buildBadgeHtml({ hasSources: true, isReviewed: true });
  assert.match(html, /bhf-badge--verified/);
  assert.match(html, /bhf-badge--reviewed/);
});

test('buildBadgeHtml returns only the gold badge when sourced but not reviewed', () => {
  const html = buildBadgeHtml({ hasSources: true, isReviewed: false });
  assert.match(html, /bhf-badge--verified/);
  assert.doesNotMatch(html, /bhf-badge--reviewed/);
});

test('buildBadgeHtml returns only the green badge when reviewed but not sourced', () => {
  const html = buildBadgeHtml({ hasSources: false, isReviewed: true });
  assert.doesNotMatch(html, /bhf-badge--verified/);
  assert.match(html, /bhf-badge--reviewed/);
});

test('buildBadgeHtml returns an empty string when neither applies', () => {
  assert.equal(buildBadgeHtml({ hasSources: false, isReviewed: false }), '');
});
```

Also append to `tests/citizen-theme.test.js`:

```js
test('defines the green reviewer-confirmed badge using established tokens', () => {
  const block = css.match(/\.bhf-badge--reviewed\s*{[^}]*}/s)[0];
  assert.match(block, /background-color:\s*var\(\s*--bhf-color-success\s*\)/);
  assert.match(block, /color:\s*var\(\s*--color-surface-0\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citation-badges.test.js tests/citizen-theme.test.js`
Expected: FAIL — `buildBadgeHtml` not exported yet; `.bhf-badge--reviewed` not defined yet.

- [ ] **Step 3: Add the implementation**

Append to `src/citation-badges.js`, before the `module.exports` guard block:

```js
function buildBadgeHtml( state ) {
	var html = '';

	if ( state.hasSources ) {
		html += '<span class="bhf-badge--verified">Sources cited</span>';
	}

	if ( state.isReviewed ) {
		html += '<span class="bhf-badge--reviewed">Reviewer confirmed</span>';
	}

	return html;
}
```

Update the guarded `module.exports` block to:

```js
if ( typeof module !== 'undefined' ) {
	module.exports = { countCitations, hasReviewedCategory, buildBadgeHtml };
}
```

Append to `src/citizen-theme.css`:

```css
.bhf-badge--reviewed {
	display: inline-block;
	background-color: var( --bhf-color-success );
	color: var( --color-surface-0 );
	border-radius: 999px;
	padding: 0.15rem 0.6rem;
	font-size: 0.75rem;
	font-weight: 600;
	margin-left: 0.35rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citation-badges.test.js tests/citizen-theme.test.js`
Expected: PASS (all tests so far in both files)

- [ ] **Step 5: Commit**

```bash
git add src/citation-badges.js tests/citation-badges.test.js src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add badge-HTML builder and green reviewer-confirmed badge"
```

---

### Task 4: Browser bootstrap wiring + breadcrumb mount point

**Files:**
- Create: `src/citation-badges.bootstrap.js`
- Modify: `src/templates/ArticleBreadcrumb.wikitext`

**Interfaces:**
- Consumes: `countCitations`, `hasReviewedCategory`, `buildBadgeHtml` from
  `src/citation-badges.js` (Tasks 2-3).
- Produces: the script pasted into `MediaWiki:Citizen.js` (after
  `citation-badges.js`'s contents) and the `#bhf-citation-badges` mount point in
  `ArticleBreadcrumb.wikitext`. Not unit-tested here — needs a real browser DOM;
  covered by Task 5's smoke-test checklist.

- [ ] **Step 1: Write the bootstrap script**

```js
// src/citation-badges.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly AFTER
// citation-badges.js's contents (both share one flat global scope on the real
// page — no require()/import there). Order relative to discovery-rail.js/
// discovery-rail.bootstrap.js from the base theme doesn't matter, as long as
// citation-badges.js precedes this file.

( function () {
	'use strict';

	function mountBadges() {
		var mount = document.getElementById( 'bhf-citation-badges' );

		if ( !mount ) {
			return;
		}

		var citationElements = document.querySelectorAll( '.bhf-citation' );
		var catlinks = document.getElementById( 'catlinks' );
		var categoryLinkTitles = catlinks ?
			Array.prototype.map.call( catlinks.querySelectorAll( 'a' ), function ( a ) {
				return a.getAttribute( 'title' ) || '';
			} ) :
			[];

		mount.innerHTML = buildBadgeHtml( {
			hasSources: countCitations( citationElements ) > 0,
			isReviewed: hasReviewedCategory( categoryLinkTitles )
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', mountBadges );
	} else {
		mountBadges();
	}
}() );
```

- [ ] **Step 2: Update the breadcrumb template**

In `src/templates/ArticleBreadcrumb.wikitext`, replace the old manually-flagged badge
span with an empty mount point for the bootstrap script to populate:

Old content:
```wikitext
<!-- src/templates/ArticleBreadcrumb.wikitext — paste as Template:ArticleBreadcrumb
    Usage directly under the article title: {{ArticleBreadcrumb|type=Person|era=18th Century|place=Nashville}} -->
<div class="bhf-breadcrumb">{{{type}}} &middot; {{{era}}} &middot; {{{place}}}{{#if:{{{verified|}}}|<span class="bhf-badge--verified">Sources verified</span>}}</div>
```

New content:
```wikitext
<!-- src/templates/ArticleBreadcrumb.wikitext — paste as Template:ArticleBreadcrumb
    Usage directly under the article title: {{ArticleBreadcrumb|type=Person|era=18th Century|place=Nashville}}
    Badges are computed automatically by citation-badges.bootstrap.js from page
    content (citation count + Category:Reviewed) — the old `verified` parameter is no
    longer read here and is silently ignored if an existing page still passes it. -->
<div class="bhf-breadcrumb">{{{type}}} &middot; {{{era}}} &middot; {{{place}}}<span id="bhf-citation-badges"></span></div>
```

- [ ] **Step 3: Manual verification note**

This file has no automated test — it needs the `mw`/browser DOM. Task 5's smoke-test
checklist additions are what actually exercise it end to end.

- [ ] **Step 4: Commit**

```bash
git add src/citation-badges.bootstrap.js src/templates/ArticleBreadcrumb.wikitext
git commit -m "feat: wire citation badges into the article breadcrumb via DOM bootstrap"
```

---

### Task 5: Extend the smoke-test checklist

**Files:**
- Modify: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1-4 (this task adds the manual verification
  steps that exercise them together for the first time, alongside the base theme's
  existing checklist items).

- [ ] **Step 1: Update the checklist**

In `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`, replace this existing
line (it references the now-removed manual `verified` parameter):

Old:
```markdown
- [ ] A test article shows the breadcrumb category tags under its title, and (when
      `verified=1` is passed) the gold "Sources verified" badge inline with them
```

New:
```markdown
- [ ] A test article shows the breadcrumb category tags under its title
- [ ] A test article with a `== Sources ==` section containing at least one
      `{{Citation}}` shows the gold "Sources cited" badge automatically (no manual
      parameter needed)
- [ ] A test article with NO `{{Citation}}` entries shows no gold badge
- [ ] Adding `[[Category:Reviewed]]` to a test article shows the green "Reviewer
      confirmed" badge alongside (or independently of) the gold badge
- [ ] A citation with `confidence=disputed` still counts toward the gold badge, and
      displays its terracotta "Disputed" tag within the Sources section
- [ ] Each of the six citation types (`archival`, `newspaper`, `book`,
      `oral-history`, `record`, `photo`) renders its distinct type label
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for automatic citation badges"
```

## Post-plan follow-ups (not part of this plan)

- Running the extended smoke test against a real MediaWiki + Citizen instance (same
  outstanding human follow-up as the base theme — no Docker in the environment this
  plan was authored in).
- Any real reviewer-identity/approval-workflow tracking, or migrating existing pages
  off the old manual `verified=1` parameter, remain explicitly out of scope per the
  spec's "Open Items" section.
