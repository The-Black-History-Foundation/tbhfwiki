# Evidence Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat, bottom-of-article `{{Citation}}` list with a
collapsible Evidence panel that organizes every source on a page into a
12-category taxonomy, while keeping the existing "Sources cited"/"Reviewer
confirmed" badges working exactly as before.

**Architecture:** A new `{{Evidence}}` template (replacing `{{Citation}}`)
renders real, visible entries inline in articles. A pure JS module
(`evidence-panel.js`) groups and renders those entries into a native
`<details>` panel; a thin browser-only bootstrap
(`evidence-panel.bootstrap.js`) reads the rendered entries' data attributes,
calls the pure functions, injects the panel, and hides the original inline
entries so nothing shows twice. `citation-badges.js` is updated to count
`.bhf-evidence-entry` elements instead of `.bhf-citation` elements.

**Tech Stack:** MediaWiki wikitext (`<includeonly>` for self-categorization
safety — the exact fix already applied to `Template:ResearchLead` in commit
`ab302d2`), plain JS (pure function/bootstrap split, matching every other
feature in this project), Node's built-in test runner.

## Global Constraints

- `{{Citation}}` is retired, not kept alongside `{{Evidence}}` — this plan
  removes `src/templates/Citation.wikitext`.
- 12 valid `type` values, exact spelling: `Primary Documents`,
  `Government Records`, `Land Records`, `Military Records`, `Maps`,
  `Letters`, `Newspapers`, `Books`, `Academic Papers`, `Oral Histories`,
  `DNA Studies`, `Archaeology`. `Primary Documents` is both a parent-grouping
  label AND a valid catch-all leaf type.
- `reliability` keeps the same 3 values as the old `confidence` field:
  `verified`, `single-source`, `disputed` — just the field name changes.
- Display order is fixed: Primary Documents (with its 5 children nested
  inside it) first, then Newspapers, Books, Academic Papers, Oral Histories,
  DNA Studies, Archaeology. Categories/subcategories with zero entries are
  omitted entirely, never shown as empty headings.
- The category tag on `Template:Evidence` MUST be wrapped in
  `<includeonly>` — without it, viewing the template's own page
  self-categorizes it (the exact bug fixed on `Template:ResearchLead` in
  commit `ab302d2`).
- The panel is a native `<details>`/`<summary>` element — collapse/expand
  works with zero JS; only the grouping requires JS.
- The bootstrap must hide the original inline `.bhf-evidence-entry`
  elements once the panel is successfully injected, so a JS-enabled reader
  never sees a source twice. A JS-disabled reader keeps seeing the plain
  inline entries (never hidden, since the hiding code never ran).
- No new colors — reuse `--bhf-color-success` (verified), `--color-subtle`
  (single-source), `--bhf-color-accent-terracotta` (disputed), exactly as
  `{{Citation}}`'s confidence tags did.
- `scanUrl` is accepted by the template but not rendered anywhere — reserved
  for future digital-scan support, no UI for it in this plan.
- No AI-assisted source suggestion, extraction, or classification anywhere
  in this plan.

---

### Task 1: `Evidence.wikitext` template + entry-card CSS

**Files:**
- Create: `src/templates/Evidence.wikitext`
- Modify: `src/citizen-theme.css:513-587` (replace the `.bhf-citation*`
  block with `.bhf-evidence-entry*`)
- Modify: `tests/citizen-theme.test.js` (replace the citation-card tests)

**Interfaces:**
- Produces: `.bhf-evidence-entry`, `.bhf-evidence-entry__title`,
  `.bhf-evidence-entry__meta`, `.bhf-evidence-entry__reliability`,
  `.bhf-evidence-entry__reliability--verified/single-source/disputed`,
  `.bhf-evidence-entry__citation` — consumed by Task 2's
  `renderEvidencePanel()` (which must emit exactly these class names) and by
  Task 4's bootstrap (which selects `.bhf-evidence-entry` elements).

- [ ] **Step 1: Write the failing tests**

In `tests/citizen-theme.test.js`, replace these three existing tests
(shown here in full, exactly as they currently appear in the file):

```js
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

Leave the test immediately after this block
(`defines the green reviewer-confirmed badge using established tokens`)
completely untouched — it is unrelated to citations/evidence.

Replace the three tests shown above with:

```js
test('defines the evidence entry card shell and reliability tag variants', () => {
  for (const cls of [
    '.bhf-evidence-entry', '.bhf-evidence-entry__title', '.bhf-evidence-entry__meta',
    '.bhf-evidence-entry__reliability', '.bhf-evidence-entry__citation'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('evidence reliability tags use the established palette tokens, not new colors', () => {
  const verifiedBlock = css.match(/\.bhf-evidence-entry__reliability--verified\s*{[^}]*}/s)[0];
  assert.match(verifiedBlock, /color:\s*var\(\s*--bhf-color-success\s*\)/);

  const singleSourceBlock = css.match(/\.bhf-evidence-entry__reliability--single-source\s*{[^}]*}/s)[0];
  assert.match(singleSourceBlock, /color:\s*var\(\s*--color-subtle\s*\)/);

  const disputedBlock = css.match(/\.bhf-evidence-entry__reliability--disputed\s*{[^}]*}/s)[0];
  assert.match(disputedBlock, /color:\s*var\(\s*--bhf-color-accent-terracotta\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-evidence-entry*` classes don't exist yet.

- [ ] **Step 3: Replace the citation CSS with evidence-entry CSS**

In `src/citizen-theme.css`, replace:

```css
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

with:

```css
.bhf-evidence-entry {
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
	border-radius: 6px;
	padding: 0.75rem 1rem;
	margin-bottom: 0.5rem;
}

.bhf-evidence-entry__title {
	font-weight: 600;
	display: block;
}

.bhf-evidence-entry__meta {
	display: block;
	font-size: 0.85rem;
	color: var( --color-subtle );
	margin-top: 0.15rem;
}

.bhf-evidence-entry__reliability {
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

.bhf-evidence-entry__reliability--verified {
	color: var( --bhf-color-success );
}

.bhf-evidence-entry__reliability--single-source {
	color: var( --color-subtle );
}

.bhf-evidence-entry__reliability--disputed {
	color: var( --bhf-color-accent-terracotta );
}

.bhf-evidence-entry__citation {
	font-size: 0.8rem;
	color: var( --color-subtle );
	font-style: italic;
	margin-top: 0.3rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Write the Evidence template**

```wikitext
<!-- src/templates/Evidence.wikitext — paste as Template:Evidence
    Usage: {{Evidence|title=...|type=...|date=...|repository=...
    |reliability=...|citation=...}}
    Required: title, type, reliability
    type must be one of: Primary Documents, Government Records,
    Land Records, Military Records, Maps, Letters, Newspapers, Books,
    Academic Papers, Oral Histories, DNA Studies, Archaeology
    reliability must be one of: verified, single-source, disputed
    Optional: date, repository, citation (a formatted reference string,
    e.g. "Smith, J. (1830). Deed Book 12, p. 45."), scanUrl (reserved for
    future digital-scan support — accepted but not yet rendered anywhere) -->
<div class="bhf-evidence-entry"
     data-evidence-title="{{{title}}}"
     data-evidence-type="{{{type}}}"
     data-evidence-date="{{{date|}}}"
     data-evidence-repository="{{{repository|}}}"
     data-evidence-reliability="{{{reliability}}}"
     data-evidence-citation="{{{citation|}}}">
<span class="bhf-evidence-entry__title">{{{title}}}</span>
<span class="bhf-evidence-entry__meta">{{{type}}}{{#if:{{{date|}}}| &middot; {{{date}}}}}{{#if:{{{repository|}}}| &middot; {{{repository}}}}}</span>
<span class="bhf-evidence-entry__reliability bhf-evidence-entry__reliability--{{{reliability}}}">{{#switch:{{{reliability}}}|verified=Verified|single-source=Single source|disputed=Disputed|#default={{{reliability}}}}}</span>
{{#if:{{{citation|}}}|<div class="bhf-evidence-entry__citation">{{{citation}}}</div>}}
</div>
<includeonly>[[Category:Evidence]]</includeonly>
```

- [ ] **Step 6: Commit**

```bash
git add src/templates/Evidence.wikitext src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add the Evidence template and entry-card CSS"
```

---

### Task 2: `evidence-panel.js` pure functions

**Files:**
- Create: `src/evidence-panel.js`
- Create: `tests/evidence-panel.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure, standalone module — matches
  the project's convention of each feature file being load-order
  independent).
- Produces: `EVIDENCE_HIERARCHY` (array of `{category, children}`),
  `escapeHtml(str)`, `countEvidenceEntries(entries)`,
  `groupEvidenceByCategory(entries)` (returns an array of
  `{category, entries, subgroups?}` — `subgroups` is only present on groups
  that have children defined in `EVIDENCE_HIERARCHY`, i.e. only on the
  "Primary Documents" group), `renderEvidencePanel(groups, totalCount)`
  (returns a `<details>` HTML string) — consumed by Task 4's bootstrap.
  Entry objects have the shape
  `{title, type, date, repository, reliability, citation}` (all strings;
  `date`/`repository`/`citation` may be empty strings).

- [ ] **Step 1: Write the failing tests**

```js
// tests/evidence-panel.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  EVIDENCE_HIERARCHY,
  countEvidenceEntries,
  groupEvidenceByCategory,
  renderEvidencePanel
} = require('../src/evidence-panel.js');

test('EVIDENCE_HIERARCHY defines Primary Documents as parent of exactly 5 children', () => {
  const primaryDocs = EVIDENCE_HIERARCHY.find((def) => def.category === 'Primary Documents');
  assert.deepEqual(primaryDocs.children, ['Government Records', 'Land Records', 'Military Records', 'Maps', 'Letters']);
});

test('countEvidenceEntries returns the number of entries', () => {
  assert.equal(countEvidenceEntries([{}, {}, {}]), 3);
  assert.equal(countEvidenceEntries([]), 0);
});

test('groupEvidenceByCategory buckets a child category under Primary Documents as a subgroup', () => {
  const entries = [
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].category, 'Primary Documents');
  assert.equal(groups[0].entries.length, 0);
  assert.equal(groups[0].subgroups.length, 1);
  assert.equal(groups[0].subgroups[0].category, 'Government Records');
  assert.equal(groups[0].subgroups[0].entries.length, 1);
});

test('groupEvidenceByCategory keeps entries directly typed Primary Documents separate from its children', () => {
  const entries = [
    { title: 'Catch-all doc', type: 'Primary Documents', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.equal(groups[0].entries.length, 1);
  assert.equal(groups[0].entries[0].title, 'Catch-all doc');
  assert.equal(groups[0].subgroups[0].entries[0].title, 'Deed');
});

test('groupEvidenceByCategory omits empty categories and never adds a subgroups key to standalone categories', () => {
  const entries = [
    { title: 'A newspaper clipping', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].category, 'Newspapers');
  assert.equal(groups[0].subgroups, undefined);
});

test('groupEvidenceByCategory produces the fixed display order regardless of input order', () => {
  const entries = [
    { title: 'A', type: 'Archaeology', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'B', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'C', type: 'Land Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.deepEqual(groups.map((g) => g.category), ['Primary Documents', 'Newspapers', 'Archaeology']);
});

test('renderEvidencePanel produces a native <details>/<summary> panel with the total count', () => {
  const groups = groupEvidenceByCategory([
    { title: 'Deed', type: 'Government Records', date: '1779', repository: 'County Archive', reliability: 'verified', citation: 'Smith, J. (1830).' }
  ]);
  const html = renderEvidencePanel(groups, 1);
  assert.match(html, /^<details class="bhf-evidence-panel">/);
  assert.match(html, /<summary class="bhf-evidence-panel__summary">Evidence \(1 source\)<\/summary>/);
  assert.match(html, /<\/details>$/);
});

test('renderEvidencePanel uses plural "sources" for counts other than 1', () => {
  const groups = groupEvidenceByCategory([
    { title: 'A', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'B', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' }
  ]);
  const html = renderEvidencePanel(groups, 2);
  assert.match(html, /Evidence \(2 sources\)/);
});

test('renderEvidencePanel shows a subcategory heading nested under its parent category heading', () => {
  const groups = groupEvidenceByCategory([
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ]);
  const html = renderEvidencePanel(groups, 1);
  assert.match(html, /<div class="bhf-evidence-panel__category">Primary Documents \(1\)<\/div>/);
  assert.match(html, /<div class="bhf-evidence-panel__subcategory">Government Records \(1\)<\/div>/);
});

test('renderEvidencePanel counts a Primary Documents heading using direct entries plus all its children combined', () => {
  const groups = groupEvidenceByCategory([
    { title: 'Catch-all', type: 'Primary Documents', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'Map', type: 'Maps', date: '', repository: '', reliability: 'verified', citation: '' }
  ]);
  const html = renderEvidencePanel(groups, 3);
  assert.match(html, /<div class="bhf-evidence-panel__category">Primary Documents \(3\)<\/div>/);
});

test('renderEvidencePanel HTML-escapes every field to prevent injection', () => {
  const groups = groupEvidenceByCategory([
    {
      title: '<script>alert(1)</script>',
      type: 'Newspapers',
      date: '"><img src=x>',
      repository: '<b>bold</b>',
      reliability: 'verified',
      citation: '<i>italic</i>'
    }
  ]);
  const html = renderEvidencePanel(groups, 1);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x>'));
  assert.ok(!html.includes('<b>bold</b>'));
  assert.ok(!html.includes('<i>italic</i>'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/evidence-panel.test.js`
Expected: FAIL with "Cannot find module '../src/evidence-panel.js'"

- [ ] **Step 3: Write the pure functions**

```js
// src/evidence-panel.js
//
// Pure functions for the Evidence Explorer panel: grouping evidence entries
// by category, rendering the collapsible panel, and counting entries (also
// reused by citation-badges.js for its "Sources cited" badge). No
// `document`/`mw`/`fetch` here — see evidence-panel.bootstrap.js for the DOM
// wiring. Defines its own escapeHtml (rather than reusing discovery-rail.js's
// or research-leads.js's) so this file has no load-order dependency on any
// other feature file when concatenated onto MediaWiki:Citizen.js.

const EVIDENCE_HIERARCHY = [
	{
		category: 'Primary Documents',
		children: [ 'Government Records', 'Land Records', 'Military Records', 'Maps', 'Letters' ]
	},
	{ category: 'Newspapers', children: [] },
	{ category: 'Books', children: [] },
	{ category: 'Academic Papers', children: [] },
	{ category: 'Oral Histories', children: [] },
	{ category: 'DNA Studies', children: [] },
	{ category: 'Archaeology', children: [] }
];

function escapeHtml(str) {
	return String( str )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

function countEvidenceEntries(entries) {
	return entries.length;
}

function groupEvidenceByCategory(entries) {
	const groups = [];

	EVIDENCE_HIERARCHY.forEach( ( def ) => {
		const directEntries = entries.filter( ( entry ) => entry.type === def.category );
		const subgroups = [];

		def.children.forEach( ( childCategory ) => {
			const childEntries = entries.filter( ( entry ) => entry.type === childCategory );
			if ( childEntries.length > 0 ) {
				subgroups.push( { category: childCategory, entries: childEntries } );
			}
		} );

		if ( directEntries.length > 0 || subgroups.length > 0 ) {
			const group = { category: def.category, entries: directEntries };
			if ( def.children.length > 0 ) {
				group.subgroups = subgroups;
			}
			groups.push( group );
		}
	} );

	return groups;
}

function renderEvidenceEntryHtml(entry) {
	let meta = escapeHtml( entry.type );
	if ( entry.date ) {
		meta += ' &middot; ' + escapeHtml( entry.date );
	}
	if ( entry.repository ) {
		meta += ' &middot; ' + escapeHtml( entry.repository );
	}

	let html = '<div class="bhf-evidence-entry">';
	html += '<span class="bhf-evidence-entry__title">' + escapeHtml( entry.title ) + '</span>';
	html += '<span class="bhf-evidence-entry__meta">' + meta + '</span>';
	html += '<span class="bhf-evidence-entry__reliability bhf-evidence-entry__reliability--' +
		escapeHtml( entry.reliability ) + '">' + escapeHtml( entry.reliability ) + '</span>';
	if ( entry.citation ) {
		html += '<div class="bhf-evidence-entry__citation">' + escapeHtml( entry.citation ) + '</div>';
	}
	html += '</div>';
	return html;
}

function renderEvidencePanel(groups, totalCount) {
	let html = '<details class="bhf-evidence-panel">';
	html += '<summary class="bhf-evidence-panel__summary">Evidence (' + totalCount +
		( totalCount === 1 ? ' source' : ' sources' ) + ')</summary>';

	groups.forEach( ( group ) => {
		const subgroupCount = group.subgroups ?
			group.subgroups.reduce( ( sum, sg ) => sum + sg.entries.length, 0 ) :
			0;
		const groupCount = group.entries.length + subgroupCount;

		html += '<div class="bhf-evidence-panel__category">' + escapeHtml( group.category ) +
			' (' + groupCount + ')</div>';

		group.entries.forEach( ( entry ) => {
			html += renderEvidenceEntryHtml( entry );
		} );

		if ( group.subgroups ) {
			group.subgroups.forEach( ( subgroup ) => {
				html += '<div class="bhf-evidence-panel__subcategory">' + escapeHtml( subgroup.category ) +
					' (' + subgroup.entries.length + ')</div>';
				subgroup.entries.forEach( ( entry ) => {
					html += renderEvidenceEntryHtml( entry );
				} );
			} );
		}
	} );

	html += '</details>';
	return html;
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = {
		EVIDENCE_HIERARCHY,
		escapeHtml,
		countEvidenceEntries,
		groupEvidenceByCategory,
		renderEvidencePanel
	};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/evidence-panel.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/evidence-panel.js tests/evidence-panel.test.js
git commit -m "feat: add evidence-panel.js grouping and rendering functions"
```

---

### Task 3: Evidence panel CSS

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)

**Interfaces:**
- Consumes: class names produced by Task 2's `renderEvidencePanel()`
  (`.bhf-evidence-panel`, `__summary`, `__category`, `__subcategory`) — this
  task must style exactly those names.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the evidence panel shell, summary, category, and subcategory headings', () => {
  for (const cls of [
    '.bhf-evidence-panel', '.bhf-evidence-panel__summary',
    '.bhf-evidence-panel__category', '.bhf-evidence-panel__subcategory'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
  const panelBlock = css.match(/\.bhf-evidence-panel\s*{[^}]*}/s)[0];
  assert.match(panelBlock, /border:.*var\(\s*--bhf-color-accent-gold\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-evidence-panel*` classes don't exist yet.

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-evidence-panel {
	background-color: var( --color-surface-0 );
	border: 1px solid var( --bhf-color-accent-gold );
	border-radius: 8px;
	padding: 1rem;
	margin-block: 1rem;
}

.bhf-evidence-panel__summary {
	font-family: var( --font-family-citizen-serif );
	font-weight: 700;
	cursor: pointer;
}

.bhf-evidence-panel__category {
	font-family: var( --font-family-citizen-serif );
	font-weight: 700;
	margin-top: 1rem;
	padding-bottom: 0.25rem;
	border-bottom: 2px solid var( --bhf-color-accent-terracotta );
}

.bhf-evidence-panel__subcategory {
	font-family: var( --font-family-citizen-serif );
	font-weight: 600;
	margin-top: 0.75rem;
	margin-left: 1rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add evidence panel shell and heading CSS"
```

---

### Task 4: `evidence-panel.bootstrap.js`

**Files:**
- Create: `src/evidence-panel.bootstrap.js`

**Interfaces:**
- Consumes: `groupEvidenceByCategory`, `countEvidenceEntries`,
  `renderEvidencePanel` from Task 2 (assumed already loaded in the same
  global scope — no `require()`, matching every other bootstrap in this
  project).
- No automated test — browser-only DOM wiring, covered by the manual
  smoke-test checklist (Task 6), matching the untested-bootstrap convention
  already established for `discovery-rail.bootstrap.js`,
  `citation-badges.bootstrap.js`, `contributor-stats.bootstrap.js`, and
  `research-leads.bootstrap.js`.

- [ ] **Step 1: Write the bootstrap**

```js
// src/evidence-panel.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly AFTER
// evidence-panel.js's contents (both share one flat global scope on the real
// page — no require()/import there).

( function () {
	'use strict';

	function extractEntryData(el) {
		return {
			title: el.getAttribute( 'data-evidence-title' ) || '',
			type: el.getAttribute( 'data-evidence-type' ) || '',
			date: el.getAttribute( 'data-evidence-date' ) || '',
			repository: el.getAttribute( 'data-evidence-repository' ) || '',
			reliability: el.getAttribute( 'data-evidence-reliability' ) || '',
			citation: el.getAttribute( 'data-evidence-citation' ) || ''
		};
	}

	function mountEvidencePanel() {
		var mount = document.getElementById( 'bhf-evidence-panel' );

		if ( !mount ) {
			return;
		}

		var entryElements = Array.prototype.slice.call(
			document.querySelectorAll( '.bhf-evidence-entry' )
		);

		if ( entryElements.length === 0 ) {
			return;
		}

		var entries = entryElements.map( extractEntryData );
		var groups = groupEvidenceByCategory( entries );
		var total = countEvidenceEntries( entries );

		mount.innerHTML = renderEvidencePanel( groups, total );

		// Hide the original inline entries now that the organized panel is
		// showing — a JS-enabled reader should see each source exactly once.
		// A JS-disabled reader keeps seeing them (this code never ran).
		entryElements.forEach( function ( el ) {
			el.style.display = 'none';
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', mountEvidencePanel );
	} else {
		mountEvidencePanel();
	}
}() );
```

- [ ] **Step 2: Manual verification note**

There is no automated test for this file (consistent with every other
`*.bootstrap.js` in this project). Verify by reading: `extractEntryData`
reads exactly the 6 `data-evidence-*` attributes `Evidence.wikitext`
produces in Task 1; `mountEvidencePanel` does nothing when
`#bhf-evidence-panel` is absent or zero entries exist; entries are hidden
only after `mount.innerHTML` is set (order in the function body).

- [ ] **Step 3: Commit**

```bash
git add src/evidence-panel.bootstrap.js
git commit -m "feat: add evidence-panel.bootstrap.js DOM wiring"
```

---

### Task 5: Update `citation-badges.js` to count Evidence entries

**Files:**
- Modify: `src/citation-badges.js:8-10`
- Modify: `src/citation-badges.js:36` (the `module.exports` line)
- Modify: `src/citation-badges.bootstrap.js:16-25`
- Modify: `tests/citation-badges.test.js:1-13`

**Interfaces:**
- Produces: `countEvidenceEntries(evidenceElements)` (renamed from
  `countCitations`) — a small, separate copy of the same-named function in
  `evidence-panel.js`, per this project's established convention of
  duplicating small utilities per module for load-order independence.
- `hasReviewedCategory` and `buildBadgeHtml` are unchanged.

- [ ] **Step 1: Write the failing test**

In `tests/citation-badges.test.js`, replace:

```js
const { countCitations, hasReviewedCategory } = require('../src/citation-badges.js');

test('countCitations returns the number of citation elements', () => {
  assert.equal(countCitations([{}, {}, {}]), 3);
});

test('countCitations returns 0 for an empty list', () => {
  assert.equal(countCitations([]), 0);
});
```

with:

```js
const { countEvidenceEntries, hasReviewedCategory } = require('../src/citation-badges.js');

test('countEvidenceEntries returns the number of evidence elements', () => {
  assert.equal(countEvidenceEntries([{}, {}, {}]), 3);
});

test('countEvidenceEntries returns 0 for an empty list', () => {
  assert.equal(countEvidenceEntries([]), 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citation-badges.test.js`
Expected: FAIL with "countEvidenceEntries is not a function" (or similar —
`citation-badges.js` still exports `countCitations` at this point).

- [ ] **Step 3: Rename the function in `citation-badges.js`**

Replace:

```js
function countCitations(citationElements) {
	return citationElements.length;
}
```

with:

```js
function countEvidenceEntries(evidenceElements) {
	return evidenceElements.length;
}
```

Replace:

```js
	module.exports = { countCitations, hasReviewedCategory, buildBadgeHtml };
```

with:

```js
	module.exports = { countEvidenceEntries, hasReviewedCategory, buildBadgeHtml };
```

- [ ] **Step 4: Update the bootstrap to select evidence entries**

In `src/citation-badges.bootstrap.js`, replace:

```js
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
```

with:

```js
		var evidenceElements = document.querySelectorAll( '.bhf-evidence-entry' );
		var catlinks = document.getElementById( 'catlinks' );
		var categoryLinkTitles = catlinks ?
			Array.prototype.map.call( catlinks.querySelectorAll( 'a' ), function ( a ) {
				return a.getAttribute( 'title' ) || '';
			} ) :
			[];

		mount.innerHTML = buildBadgeHtml( {
			hasSources: countEvidenceEntries( evidenceElements ) > 0,
			isReviewed: hasReviewedCategory( categoryLinkTitles )
		} );
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/citation-badges.test.js`
Expected: PASS (all tests)

- [ ] **Step 6: Commit**

```bash
git add src/citation-badges.js src/citation-badges.bootstrap.js tests/citation-badges.test.js
git commit -m "feat: point citation-badges at Evidence entries instead of Citation"
```

---

### Task 6: Retire `Citation.wikitext` and update the README

**Files:**
- Delete: `src/templates/Citation.wikitext`
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing new — this is cleanup/documentation only.

- [ ] **Step 1: Delete the old template**

```bash
git rm src/templates/Citation.wikitext
```

- [ ] **Step 2: Update the README's Features section**

Replace:

```markdown
- **Source-citation tooling** — a `{{Citation}}` template with source types
  and confidence ratings, plus automatic "Sources cited" and "Reviewer
  confirmed" badges computed from real page content (never a manual flag).
```

with:

```markdown
- **Evidence Explorer** — a `{{Evidence}}` template organizing sources into
  a 12-category taxonomy (Primary Documents and its five sub-types, plus
  Newspapers, Books, Academic Papers, Oral Histories, DNA Studies, and
  Archaeology), rendered as a collapsible per-article panel, plus automatic
  "Sources cited" and "Reviewer confirmed" badges computed from real page
  content (never a manual flag).
```

- [ ] **Step 3: Update the README's deployment JS-file list**

Replace:

```markdown
   - `src/discovery-rail.js` then `src/discovery-rail.bootstrap.js`
   - `src/citation-badges.js` then `src/citation-badges.bootstrap.js`
   - `src/contributor-stats.js` then `src/contributor-stats.bootstrap.js`
   - `src/research-leads.js` then `src/research-leads.bootstrap.js`
```

with:

```markdown
   - `src/discovery-rail.js` then `src/discovery-rail.bootstrap.js`
   - `src/evidence-panel.js` then `src/evidence-panel.bootstrap.js`
   - `src/citation-badges.js` then `src/citation-badges.bootstrap.js`
   - `src/contributor-stats.js` then `src/contributor-stats.bootstrap.js`
   - `src/research-leads.js` then `src/research-leads.bootstrap.js`
```

- [ ] **Step 4: Update the README's Templates table**

Replace:

```markdown
| `Citation.wikitext` | `Template:Citation` |
```

with:

```markdown
| `Evidence.wikitext` | `Template:Evidence` |
```

- [ ] **Step 5: Correct the stale "Verifying on a live wiki" section**

Replace:

```markdown
## Verifying on a live wiki

This project was built without a live MediaWiki instance available (no
Docker in the build environment), so none of it has been visually verified
in a browser yet. `docker-compose.yml` brings up a local MediaWiki + Citizen
stack for exactly that purpose — see
`docs/superpowers/plans/2026-07-06-smoke-test-checklist.md` for the full
manual verification checklist to run through once it's up.
```

with:

```markdown
## Verifying on a live wiki

Every feature through the homepage redesign has been deployed to and
verified against a real running MediaWiki + Citizen instance (MediaWiki
1.43.9, SQLite backend) — not just unit-tested. `docker-compose.yml` brings
up an equivalent local stack for anyone reproducing this; see
`docs/superpowers/plans/2026-07-06-smoke-test-checklist.md` for the full
manual verification checklist. New features (like this one) should still be
walked through that checklist before being considered done.
```

- [ ] **Step 6: Commit**

```bash
git add src/templates/Citation.wikitext README.md
git commit -m "chore: retire Template:Citation and update README for Evidence Explorer"
```

---

### Task 7: Extend the smoke-test checklist

**Files:**
- Modify: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1-6.

- [ ] **Step 1: Update the checklist**

Append to `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`:

```markdown
## Evidence Explorer

- [ ] A page with `{{Evidence}}` entries in multiple categories —
      including at least one entry typed directly `Primary Documents` and
      at least one entry typed `Government Records` — shows a single
      collapsible "Evidence (N sources)" panel with `Primary Documents`
      first (its direct entries, then its `Government Records` subheading),
      followed by any standalone categories present
- [ ] Categories and subcategories with zero entries do not appear as empty
      headings anywhere in the panel
- [ ] With JavaScript disabled, the plain `{{Evidence}}` entries remain
      visible inline, ungrouped, exactly where the editor placed them — no
      panel appears
- [ ] With JavaScript enabled, each source appears exactly once (inside the
      panel) — the original inline entries are hidden, not also visible
- [ ] The panel's `<summary>` toggle opens and closes the panel with no
      JavaScript required for that specific interaction
- [ ] A page with zero `{{Evidence}}` entries shows no panel at all
- [ ] The "Sources cited" gold badge still appears automatically on any
      page with at least one `{{Evidence}}` entry, and the "Reviewer
      confirmed" green badge still appears independently from
      `[[Category:Reviewed]]` — both badges work exactly as they did before
      this feature
- [ ] Viewing `Template:Evidence` directly does NOT add it to
      `Category:Evidence` (confirms the `<includeonly>` wrapper is intact)
- [ ] Browser console shows no JS errors on an article with an Evidence
      panel
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for the Evidence Explorer"
```

## Post-plan follow-ups (not part of this plan)

- This repo's live test wiki has 3 sample `{{Citation}}` usages (in the
  `Robert "Black Bob" Renfro` and `Fort Nashborough` articles) that exist
  only as gitignored staging content in `wiki-uploads/`, not as
  git-tracked deliverables — converting those to `{{Evidence}}` and
  redeploying to the live test wiki for end-to-end verification is a
  manual follow-up, not a plan task.
- Actual digital-scan upload/viewing UI (the `scanUrl` field stays reserved
  but inert).
- Any AI-assisted source suggestion, extraction, or classification.
- Per-category independent collapse/expand within the panel.
