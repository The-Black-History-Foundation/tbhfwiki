# Research Leads Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give community-held historical accounts a structured home — a
`Template:ResearchLead` capturing what's believed and what it would take to
advance (archival access, translation, fieldwork, funding, expertise,
digitization) — plus a browsable Leads Board grouping open leads by what
they need.

**Architecture:** Follows the exact pure-function/bootstrap split already
established by three earlier features in this project (discovery rail,
citation tooling, contributor profiles): pure JS in `src/research-leads.js`,
a thin browser-only bootstrap in `src/research-leads.bootstrap.js`, CSS
appended to the shared `src/citizen-theme.css`, and wikitext templates. Leads
are organized entirely by MediaWiki category (no new namespace, no config
change) — a lead's own template auto-tags it into `Category:Research Leads`,
one category per need-trigger, and one category per status, purely from its
own parameters.

**Tech Stack:** Plain CSS (custom properties, reusing established tokens),
vanilla JS (CommonJS-guarded exports, browser globals only in the bootstrap
layer, jQuery's `$.when` for coordinating parallel `mw.Api()` calls — jQuery
is a standard MediaWiki dependency, not a new one), Node's built-in test
runner (`node:test` + `node:assert/strict`, Node 24 — no npm dependencies),
MediaWiki wikitext with ParserFunctions (`{{#if:}}`/`{{#switch:}}` — already
relied on by every template in this project).

## Global Constraints

- No new MediaWiki extension, no new namespace, no `LocalSettings.php`
  changes — CSS/JS/wikitext only.
- Need-trigger values: exactly `archival`, `translation`, `fieldwork`,
  `funding`, `expertise`, `digitization` (six, fixed). Status values: exactly
  `open`, `in-progress`, `resolved` (three, fixed).
- `needed1` through `needed3` are discrete numbered parameters, NOT a
  pipe-separated string — same reasoning as `Template:ContributorProfile`'s
  `interest1`..`interest5` (avoids the Arrays extension dependency).
- Auto-categorization happens inside `Template:ResearchLead` via
  `{{#switch:}}` on the template's own parameters — never manually added by
  an editor, so category membership can't drift from what the lead actually
  declares.
- The Leads Board excludes resolved leads by default — computed by
  intersecting each need-category's membership with `Category:Lead Status
  Open`'s membership, not by trusting any single category alone.
- Status badge colors (verified WCAG AA during the base theme project, reused
  unchanged here): `open` = gold fill (`--bhf-color-accent-gold`) with
  espresso text (`--bhf-color-text-on-gold`), matching the established
  gold-fill-only rule; `in-progress` = terracotta fill
  (`--bhf-color-accent-terracotta`) with parchment text
  (`--color-surface-0`) — 4.97:1, passes AA; `resolved` = success-green fill
  (`--bhf-color-success`) with parchment text — 6.47:1, passes AA.
- `research-leads.js` defines its OWN local `titleToUrl`/`escapeHtml` helpers
  rather than reusing `discovery-rail.js`'s — this is deliberate: it keeps
  this feature file self-contained with no load-order dependency on any
  other feature file when all of them get concatenated onto
  `MediaWiki:Citizen.js`.
- The `campaignUrl` field on `Template:ResearchLead` is accepted but not
  rendered as a distinct call-to-action beyond a plain link in this plan —
  Charity Coin does not exist yet; this is a forward-compatible field only,
  not a feature to build against.

---

### Task 1: Lead page CSS + `Template:ResearchLead`

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Create: `src/templates/ResearchLead.wikitext`

**Interfaces:**
- Produces: `.bhf-lead`, `.bhf-lead__summary`, `.bhf-lead__known`,
  `.bhf-lead__needs`, `.bhf-lead__need-tag`,
  `.bhf-lead__need-tag--archival`/`--translation`/`--fieldwork`/`--funding`/
  `--expertise`/`--digitization`, `.bhf-lead__status`,
  `.bhf-lead__status--open`/`--in-progress`/`--resolved`,
  `.bhf-lead__discuss` CSS classes, consumed by `Template:ResearchLead` in
  this task.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the lead card shell, need-tag variants, and status badge variants', () => {
  for (const cls of [
    '.bhf-lead', '.bhf-lead__summary', '.bhf-lead__known', '.bhf-lead__needs',
    '.bhf-lead__need-tag',
    '.bhf-lead__need-tag--archival', '.bhf-lead__need-tag--translation',
    '.bhf-lead__need-tag--fieldwork', '.bhf-lead__need-tag--funding',
    '.bhf-lead__need-tag--expertise', '.bhf-lead__need-tag--digitization',
    '.bhf-lead__status',
    '.bhf-lead__status--open', '.bhf-lead__status--in-progress', '.bhf-lead__status--resolved',
    '.bhf-lead__discuss'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('need-tag variants set a distinct label via ::before content', () => {
  assert.match(css, /\.bhf-lead__need-tag--archival::before\s*{\s*content:\s*"Archival Access"/);
  assert.match(css, /\.bhf-lead__need-tag--digitization::before\s*{\s*content:\s*"Digitization"/);
});

test('status badges use the established gold-fill/terracotta-fill/green-fill contrast pattern', () => {
  const openBlock = css.match(/\.bhf-lead__status--open\s*{[^}]*}/s)[0];
  assert.match(openBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(openBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);

  const inProgressBlock = css.match(/\.bhf-lead__status--in-progress\s*{[^}]*}/s)[0];
  assert.match(inProgressBlock, /background-color:\s*var\(\s*--bhf-color-accent-terracotta\s*\)/);
  assert.match(inProgressBlock, /color:\s*var\(\s*--color-surface-0\s*\)/);

  const resolvedBlock = css.match(/\.bhf-lead__status--resolved\s*{[^}]*}/s)[0];
  assert.match(resolvedBlock, /background-color:\s*var\(\s*--bhf-color-success\s*\)/);
  assert.match(resolvedBlock, /color:\s*var\(\s*--color-surface-0\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (3 new failures — classes/rules not defined yet)

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-lead {
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
	border-radius: 8px;
	padding: 1rem 1.25rem;
	margin-bottom: 1.5rem;
}

.bhf-lead__summary {
	margin-bottom: 0.5rem;
}

.bhf-lead__known {
	font-size: 0.9rem;
	color: var( --color-subtle );
	margin-bottom: 0.5rem;
}

.bhf-lead__needs {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
	margin-bottom: 0.5rem;
}

.bhf-lead__need-tag {
	display: inline-block;
	font-size: 0.75rem;
	color: var( --color-subtle );
	border: 1px solid var( --border-color-base );
	border-radius: 999px;
	padding: 0.1rem 0.55rem;
}

.bhf-lead__need-tag--archival::before {
	content: "Archival Access";
}

.bhf-lead__need-tag--translation::before {
	content: "Translation";
}

.bhf-lead__need-tag--fieldwork::before {
	content: "Fieldwork";
}

.bhf-lead__need-tag--funding::before {
	content: "Funding";
}

.bhf-lead__need-tag--expertise::before {
	content: "Expertise";
}

.bhf-lead__need-tag--digitization::before {
	content: "Digitization";
}

.bhf-lead__status {
	display: inline-block;
	border-radius: 999px;
	padding: 0.15rem 0.6rem;
	font-size: 0.75rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
}

.bhf-lead__status--open {
	background-color: var( --bhf-color-accent-gold );
	color: var( --bhf-color-text-on-gold );
}

.bhf-lead__status--in-progress {
	background-color: var( --bhf-color-accent-terracotta );
	color: var( --color-surface-0 );
}

.bhf-lead__status--resolved {
	background-color: var( --bhf-color-success );
	color: var( --color-surface-0 );
}

.bhf-lead__discuss {
	display: block;
	font-size: 0.85rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the ResearchLead template**

```wikitext
<!-- src/templates/ResearchLead.wikitext — paste as Template:ResearchLead
    Usage: {{ResearchLead|summary=...|known=...|needed1=archival|needed2=fieldwork|status=open}}
    Required: summary, status (open|in-progress|resolved)
    Optional: known, needed1 through needed3 (archival|translation|fieldwork|
    funding|expertise|digitization, one per slot, not pipe-separated),
    campaignUrl (a future Charity Coin link — only meaningful when one of
    needed1-needed3 is funding; not required, not yet used anywhere) -->
<div class="bhf-lead">
<div class="bhf-lead__summary">{{{summary}}}</div>
{{#if:{{{known|}}}|<div class="bhf-lead__known">{{{known}}}</div>}}
<div class="bhf-lead__needs">{{#if:{{{needed1|}}}|<span class="bhf-lead__need-tag bhf-lead__need-tag--{{{needed1}}}"></span>}}{{#if:{{{needed2|}}}|<span class="bhf-lead__need-tag bhf-lead__need-tag--{{{needed2}}}"></span>}}{{#if:{{{needed3|}}}|<span class="bhf-lead__need-tag bhf-lead__need-tag--{{{needed3}}}"></span>}}</div>
<span class="bhf-lead__status bhf-lead__status--{{{status}}}">{{#switch:{{{status}}}|open=Open|in-progress=In Progress|resolved=Resolved|#default={{{status}}}}}</span>
<div class="bhf-lead__discuss">[[Talk:{{FULLPAGENAME}}|Discuss this lead]]</div>
[[Category:Research Leads]]{{#switch:{{{needed1|}}}|archival=[[Category:Needs Archival Access]]|translation=[[Category:Needs Translation]]|fieldwork=[[Category:Needs Fieldwork]]|funding=[[Category:Needs Funding]]|expertise=[[Category:Needs Expertise]]|digitization=[[Category:Needs Digitization]]}}{{#switch:{{{needed2|}}}|archival=[[Category:Needs Archival Access]]|translation=[[Category:Needs Translation]]|fieldwork=[[Category:Needs Fieldwork]]|funding=[[Category:Needs Funding]]|expertise=[[Category:Needs Expertise]]|digitization=[[Category:Needs Digitization]]}}{{#switch:{{{needed3|}}}|archival=[[Category:Needs Archival Access]]|translation=[[Category:Needs Translation]]|fieldwork=[[Category:Needs Fieldwork]]|funding=[[Category:Needs Funding]]|expertise=[[Category:Needs Expertise]]|digitization=[[Category:Needs Digitization]]}}{{#switch:{{{status}}}|open=[[Category:Lead Status Open]]|in-progress=[[Category:Lead Status In Progress]]|resolved=[[Category:Lead Status Resolved]]}}
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/ResearchLead.wikitext
git commit -m "feat: add lead card CSS and Template:ResearchLead"
```

---

### Task 2: Pure leads-grouping and card-rendering functions

**Files:**
- Create: `src/research-leads.js`
- Create: `tests/research-leads.test.js`

**Interfaces:**
- Produces: `NEED_TYPES` (array of the six fixed need-trigger strings),
  `titleToUrl(title)` → string, `escapeHtml(str)` → string,
  `groupLeadsByNeed(openTitles, needMemberships)` → object keyed by each of
  the six need types (value: array of page-title strings, filtered to only
  those present in `openTitles`), `renderLeadCard(lead)` → HTML string where
  `lead` is `{ title, url, extract }`. All pure, no `document`/`mw`/`fetch`.
  Exported via a guarded `module.exports` (same pattern as every other
  feature file in this project). Consumed by Task 3's bootstrap.

- [ ] **Step 1: Write the failing test**

```js
// tests/research-leads.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  NEED_TYPES,
  titleToUrl,
  escapeHtml,
  groupLeadsByNeed,
  renderLeadCard,
} = require('../src/research-leads.js');

test('titleToUrl converts spaces to underscores and percent-encodes special characters', () => {
  assert.equal(titleToUrl('Lead: Hidden burial ground'), '/wiki/Lead%3A_Hidden_burial_ground');
});

test('groupLeadsByNeed filters each need category down to open leads only', () => {
  const openTitles = ['Lead: A', 'Lead: B'];
  const needMemberships = {
    archival: ['Lead: A', 'Lead: C'],
    translation: [],
    fieldwork: ['Lead: B'],
    funding: [],
    expertise: [],
    digitization: [],
  };

  const result = groupLeadsByNeed(openTitles, needMemberships);

  assert.deepEqual(result.archival, ['Lead: A']);
  assert.deepEqual(result.fieldwork, ['Lead: B']);
  assert.deepEqual(result.translation, []);
});

test('groupLeadsByNeed returns all six need types even when memberships omit some', () => {
  const result = groupLeadsByNeed([], {});
  for (const needType of NEED_TYPES) {
    assert.deepEqual(result[needType], []);
  }
});

test('groupLeadsByNeed excludes a lead from every group once it is no longer open', () => {
  const openTitles = ['Lead: A'];
  const needMemberships = {
    archival: ['Lead: B'],
    translation: [],
    fieldwork: [],
    funding: [],
    expertise: [],
    digitization: [],
  };

  const result = groupLeadsByNeed(openTitles, needMemberships);

  assert.deepEqual(result.archival, []);
});

test('renderLeadCard includes title, excerpt, and link', () => {
  const html = renderLeadCard({
    title: 'Lead: Hidden burial ground near Union Street',
    url: '/wiki/Lead%3A_Hidden_burial_ground_near_Union_Street',
    extract: 'Community oral histories describe a burial ground beneath the lot.',
  });

  assert.match(html, /class="bhf-lead-card"/);
  assert.match(html, /href="\/wiki\/Lead%3A_Hidden_burial_ground_near_Union_Street"/);
  assert.match(html, />Lead: Hidden burial ground near Union Street</);
  assert.match(html, /Community oral histories describe a burial ground beneath the lot\./);
});

test('renderLeadCard omits the excerpt span when extract is empty', () => {
  const html = renderLeadCard({
    title: 'Lead: X',
    url: '/wiki/Lead%3A_X',
    extract: '',
  });

  assert.ok(!html.includes('bhf-lead-card__excerpt'));
});

test('renderLeadCard escapes HTML in title and extract to prevent injection', () => {
  const html = renderLeadCard({
    title: '<script>alert(1)</script>',
    url: '/wiki/Test',
    extract: '<b>x</b>',
  });

  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>x</b>'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/research-leads.test.js`
Expected: FAIL — `../src/research-leads.js` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```js
// src/research-leads.js
//
// Pure functions for the research-leads board: grouping open leads by what
// they need, and rendering each lead as a card. No `document`/`mw`/`fetch`
// here — see research-leads.bootstrap.js for the API wiring. Defines its own
// titleToUrl/escapeHtml (rather than reusing discovery-rail.js's) so this
// file has no load-order dependency on any other feature file when
// concatenated onto MediaWiki:Citizen.js.

const NEED_TYPES = [ 'archival', 'translation', 'fieldwork', 'funding', 'expertise', 'digitization' ];

function titleToUrl(title) {
	return '/wiki/' + encodeURIComponent( title.replace( / /g, '_' ) );
}

function escapeHtml(str) {
	return String( str )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

function groupLeadsByNeed(openTitles, needMemberships) {
	const openSet = new Set( openTitles );
	const grouped = {};

	NEED_TYPES.forEach( ( needType ) => {
		const members = needMemberships[ needType ] || [];
		grouped[ needType ] = members.filter( ( title ) => openSet.has( title ) );
	} );

	return grouped;
}

function renderLeadCard(lead) {
	return (
		'<a class="bhf-lead-card" href="' + escapeHtml( lead.url ) + '">' +
		'<span class="bhf-lead-card__title">' + escapeHtml( lead.title ) + '</span>' +
		( lead.extract ?
			'<span class="bhf-lead-card__excerpt">' + escapeHtml( lead.extract ) + '</span>' :
			'' ) +
		'</a>'
	);
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = { NEED_TYPES, titleToUrl, escapeHtml, groupLeadsByNeed, renderLeadCard };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/research-leads.test.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/research-leads.js tests/research-leads.test.js
git commit -m "feat: add pure leads-grouping and card-rendering functions"
```

---

### Task 3: Bootstrap wiring (7 parallel API calls)

**Files:**
- Create: `src/research-leads.bootstrap.js`

**Interfaces:**
- Consumes: `NEED_TYPES`, `titleToUrl`, `escapeHtml`, `groupLeadsByNeed`,
  `renderLeadCard` from `src/research-leads.js` (Task 2).
- Produces: the script pasted into `MediaWiki:Citizen.js` (after
  `research-leads.js`'s contents). Not unit-tested here — needs a real
  browser DOM, `mw`, and jQuery; covered by Task 5's smoke-test checklist.

**Note for whoever implements this task:** this is the most complex
bootstrap in the project — it makes 7 API calls (1 to get open leads +
extracts via a `generator=categorymembers` query, then 6 more in parallel,
one per need-category, coordinated with jQuery's `$.when`). Read the whole
code block below carefully before typing; don't improvise the promise
coordination differently, since `$.when.apply($, needCalls)`'s callback
argument shape (one array-of-3 argument PER promise, when more than one
promise is passed) is easy to get subtly wrong.

- [ ] **Step 1: Write the bootstrap script**

```js
// src/research-leads.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly
// AFTER research-leads.js's contents (both share one flat global scope on
// the real page — no require()/import there). Order relative to other
// features' files doesn't matter, as long as research-leads.js precedes
// this file.

( function () {
	'use strict';

	var NEED_CATEGORY_TITLES = {
		archival: 'Needs Archival Access',
		translation: 'Needs Translation',
		fieldwork: 'Needs Fieldwork',
		funding: 'Needs Funding',
		expertise: 'Needs Expertise',
		digitization: 'Needs Digitization'
	};

	function mountBoard() {
		var mount = document.getElementById( 'bhf-leads-board' );

		if ( !mount ) {
			return;
		}

		var api = new mw.Api();

		api.get( {
			action: 'query',
			generator: 'categorymembers',
			gcmtitle: 'Category:Lead Status Open',
			gcmlimit: 50,
			prop: 'extracts',
			exintro: 1,
			explaintext: 1,
			exsentences: 1
		} ).done( function ( openData ) {
			var pages = ( openData.query && openData.query.pages ) || {};
			var openTitles = [];
			var extractsByTitle = {};

			Object.keys( pages ).forEach( function ( pageId ) {
				var page = pages[ pageId ];
				openTitles.push( page.title );
				extractsByTitle[ page.title ] = page.extract || '';
			} );

			if ( openTitles.length === 0 ) {
				return;
			}

			var needCalls = NEED_TYPES.map( function ( needType ) {
				return api.get( {
					action: 'query',
					list: 'categorymembers',
					cmtitle: 'Category:' + NEED_CATEGORY_TITLES[ needType ],
					cmlimit: 50,
					cmprop: 'title'
				} );
			} );

			// $.when with more than one promise passes one argument PER
			// promise to .done(), and since mw.Api().get() resolves with
			// (data, jqXHR) — two values — each argument here is itself an
			// array [data, jqXHR]. NEED_TYPES always has 6 entries (fixed),
			// so this always takes the "multiple promises" branch, never
			// jQuery's single-promise special case.
			$.when.apply( $, needCalls ).done( function () {
				var responses = Array.prototype.slice.call( arguments ).map( function ( argsForOneCall ) {
					return argsForOneCall[ 0 ];
				} );
				var needMemberships = {};

				NEED_TYPES.forEach( function ( needType, index ) {
					var data = responses[ index ];
					var members = ( data.query && data.query.categorymembers ) || [];
					needMemberships[ needType ] = members.map( function ( m ) { return m.title; } );
				} );

				var grouped = groupLeadsByNeed( openTitles, needMemberships );
				var html = '';

				NEED_TYPES.forEach( function ( needType ) {
					var titles = grouped[ needType ];

					if ( titles.length === 0 ) {
						return;
					}

					html += '<section class="bhf-leads-group">' +
						'<h2>' + NEED_CATEGORY_TITLES[ needType ] + '</h2>' +
						'<div class="bhf-leads-group__cards">' +
						titles.map( function ( title ) {
							return renderLeadCard( {
								title: title,
								url: titleToUrl( title ),
								extract: extractsByTitle[ title ] || ''
							} );
						} ).join( '' ) +
						'</div>' +
						'</section>';
				} );

				mount.innerHTML = html;
			} ).fail( function () {
				mw.log.warn( 'research-leads: failed to fetch need-category memberships' );
			} );
		} ).fail( function () {
			mw.log.warn( 'research-leads: failed to fetch open leads' );
		} );
	}

	mw.loader.using( 'mediawiki.api' ).then( function () {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', mountBoard );
		} else {
			mountBoard();
		}
	} );
}() );
```

- [ ] **Step 2: Syntax sanity check**

Run: `node --check src/research-leads.bootstrap.js`
Expected: no output (syntax valid). This is a sanity check only — this file
needs the `mw`/`document`/`jQuery` globals that only exist on a real
MediaWiki page, so Task 5's manual browser smoke test is what actually
exercises it.

- [ ] **Step 3: Commit**

```bash
git add src/research-leads.bootstrap.js
git commit -m "feat: add mw.Api bootstrap wiring for the research leads board"
```

---

### Task 4: Leads Board page CSS + page content

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Create: `src/templates/LeadsBoard.wikitext`

**Interfaces:**
- Consumes: `.bhf-masthead` (already defined by the base theme, reused
  as-is for the board page's header — no new masthead CSS needed).
- Produces: `.bhf-leads-group`, `.bhf-leads-group__cards`, `.bhf-lead-card`,
  `.bhf-lead-card__title`, `.bhf-lead-card__excerpt` CSS classes, matching
  exactly the class names `renderLeadCard` (Task 2) and the bootstrap's
  `<section>`/`<h2>`/wrapper markup (Task 3) already produce. The
  `#bhf-leads-board` mount point is consumed by Task 3's bootstrap.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the leads board group layout and lead-card classes', () => {
  for (const cls of [
    '.bhf-leads-group', '.bhf-leads-group__cards', '.bhf-lead-card',
    '.bhf-lead-card__title', '.bhf-lead-card__excerpt'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('the lead card is a single anchor with no nested link (unlike the discovery rail card)', () => {
  const block = css.match(/\.bhf-lead-card\s*{[^}]*}/s)[0];
  assert.match(block, /text-decoration:\s*none/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (2 new failures)

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-leads-group {
	margin-bottom: 2rem;
}

.bhf-leads-group h2 {
	font-family: var( --font-family-citizen-serif );
	font-size: 1.1rem;
}

.bhf-leads-group__cards {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.bhf-lead-card {
	display: flex;
	flex-direction: column;
	text-decoration: none;
	padding: 0.5rem 0.75rem;
	border-radius: 6px;
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
}

.bhf-lead-card:hover {
	background-color: var( --color-surface-2 );
}

.bhf-lead-card__title {
	font-weight: 600;
	color: var( --color-emphasized );
}

.bhf-lead-card__excerpt {
	font-size: 0.85rem;
	color: var( --color-subtle );
	margin-top: 0.2rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the Leads Board page content**

```wikitext
<!-- src/templates/LeadsBoard.wikitext — paste as the content of a new page
    (e.g. "Research Leads"), then link to it from site navigation so
    visitors can find it. -->
<div class="bhf-masthead">
'''Research Leads'''

''Community accounts that need help to move forward — archival research, translation, fieldwork, funding, expertise, or digitization.''
</div>

<div id="bhf-leads-board"></div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/LeadsBoard.wikitext
git commit -m "feat: add leads board page CSS and page content"
```

---

### Task 5: Extend the smoke-test checklist

**Files:**
- Modify: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1-4 (this task adds the manual
  verification steps that exercise them together for the first time).

- [ ] **Step 1: Update the checklist**

Append to `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`:

```markdown
- [ ] A lead page with `{{ResearchLead|status=open|needed1=archival|needed2=fieldwork|...}}`
      shows the summary, known-so-far text, both need tags with their labels
      (not raw parameter values), an "Open" gold status badge, and a working
      "Discuss this lead" link to its Talk page
- [ ] The lead page's category footer includes "Research Leads", "Needs
      Archival Access", "Needs Fieldwork", and "Lead Status Open" (invisible
      in the card itself, visible in the standard MediaWiki category footer)
- [ ] The Research Leads board page shows that same lead under BOTH the
      "Needs Archival Access" and "Needs Fieldwork" groups
- [ ] Changing that lead's `status` to `resolved` and re-saving removes it
      from the board entirely, even though its need-categories haven't
      changed
- [ ] A lead with no `neededN` values set shows no need tags, and does not
      appear in any group on the board (only in `Category:Research Leads`
      directly)
- [ ] Browser console shows no JS errors on the Leads Board page, including
      when zero leads are currently open (empty board, not a broken one)
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for the research leads board"
```

## Post-plan follow-ups (not part of this plan)

- Running the extended smoke test against a real MediaWiki + Citizen
  instance (same outstanding human follow-up as every earlier feature in
  this project — no Docker in the environment this plan was authored in).
- Building or integrating with Charity Coin, any volunteer-tracking system,
  a dedicated `Lead:` namespace, or status-change notifications all remain
  explicitly out of scope per the spec's "Open Items" section.
