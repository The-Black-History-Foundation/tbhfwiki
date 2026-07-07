# Contributor Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give contributors a styled bio/research-interests profile on their
existing MediaWiki `User:` page, with automatically-computed contribution
stats, and link the homepage discovery rail's contributor names to those
profiles.

**Architecture:** Follows the same pure-function/bootstrap split already used
by `discovery-rail.js`/`.bootstrap.js` and `citation-badges.js`/`.bootstrap.js`:
pure, unit-testable JS in `src/contributor-stats.js`, a thin browser-only
bootstrap in `src/contributor-stats.bootstrap.js`, CSS appended to the shared
`src/citizen-theme.css`, and a wikitext template
(`src/templates/ContributorProfile.wikitext`). No new MediaWiki extension, no
new backend.

**Tech Stack:** Plain CSS (custom properties, reusing base-theme tokens),
vanilla JS (CommonJS-guarded exports, browser globals only in the bootstrap
layer), Node's built-in test runner (`node:test` + `node:assert/strict`, Node
24 — no npm dependencies), MediaWiki wikitext with ParserFunctions
(`{{#if:}}` — already relied on by every prior template in this project).

## Global Constraints

- No new MediaWiki extension and no new backend — CSS/JS/wikitext only.
- Profile fields: `bio` (required), `interest1` through `interest5`
  (optional, individual tags — NOT a pipe-separated string; that would need
  the Arrays extension, a real new dependency this project avoids), `featured`
  (optional wikilink).
- Three automatically-computed stats, never manually entered: distinct
  articles contributed, "citations across your N most recently edited
  articles" (a disclosed proxy, capped at 50 pages — see spec's "Citation Stat
  Proxy" section for why exact per-citation attribution isn't feasible here),
  and last-active date.
- Pure JS functions (`countDistinctArticles`, `lastActiveDate`,
  `countCitationTemplateUsages`, `sumCitationCounts`) must never touch
  `document`/`mw`/`fetch` directly — only the bootstrap file does DOM/API
  access.
- The discovery rail's `renderCard` currently wraps the ENTIRE card in one
  `<a class="bhf-rail-card">`. Adding a second link (to the contributor's
  profile) inside that same anchor would produce invalid nested-anchor HTML.
  Task 4 restructures the card to a `<div class="bhf-rail-card">` wrapper with
  two sibling links (`.bhf-rail-card__title` for the article,
  `.bhf-rail-card__user-link` for the profile) instead of one link nested
  inside another.
- The stats mount point (`#bhf-contributor-stats`) only ever contains
  plain text (`mount.textContent`, not `innerHTML`) — the computed numbers
  need no HTML markup, so this sidesteps any escaping concern entirely for
  that piece.

---

### Task 1: Contributor profile CSS + `Template:ContributorProfile`

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Create: `src/templates/ContributorProfile.wikitext`

**Interfaces:**
- Produces: `.bhf-profile`, `.bhf-profile__bio`, `.bhf-profile__tags`,
  `.bhf-profile__tag`, `.bhf-profile-stats`, `.bhf-profile__featured`,
  `.bhf-profile__featured-label` CSS classes, consumed by
  `Template:ContributorProfile` in this task. The `#bhf-contributor-stats`
  mount point (given the `.bhf-profile-stats` class for text styling) is
  consumed by Task 3's bootstrap.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the contributor profile card shell and its sub-components', () => {
  for (const cls of [
    '.bhf-profile', '.bhf-profile__bio', '.bhf-profile__tags',
    '.bhf-profile__tag', '.bhf-profile-stats', '.bhf-profile__featured',
    '.bhf-profile__featured-label'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('profile tags use established border/text tokens, not new colors', () => {
  const block = css.match(/\.bhf-profile__tag\s*{[^}]*}/s)[0];
  assert.match(block, /color:\s*var\(\s*--color-subtle\s*\)/);
  assert.match(block, /border:.*var\(\s*--border-color-base\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL (2 new failures — classes not defined yet)

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-profile {
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
	border-radius: 8px;
	padding: 1rem 1.25rem;
	margin-bottom: 1.5rem;
}

.bhf-profile__bio {
	margin-bottom: 0.5rem;
}

.bhf-profile__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
	margin-bottom: 0.5rem;
}

.bhf-profile__tag {
	display: inline-block;
	font-size: 0.75rem;
	color: var( --color-subtle );
	border: 1px solid var( --border-color-base );
	border-radius: 999px;
	padding: 0.1rem 0.55rem;
}

.bhf-profile-stats {
	font-size: 0.85rem;
	color: var( --color-subtle );
	margin-bottom: 0.5rem;
}

.bhf-profile__featured {
	border-top: 1px solid var( --border-color-base );
	padding-top: 0.5rem;
	font-size: 0.9rem;
}

.bhf-profile__featured-label {
	display: block;
	text-transform: uppercase;
	font-size: 0.7rem;
	letter-spacing: 0.03em;
	color: var( --color-subtle );
	margin-bottom: 0.15rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests so far)

- [ ] **Step 5: Write the ContributorProfile template**

```wikitext
<!-- src/templates/ContributorProfile.wikitext — paste as Template:ContributorProfile
    Usage on your own User: page:
    {{ContributorProfile|bio=...|interest1=Nashville|interest2=Oral History|featured=Robert Renfro}}
    Required: bio
    Optional: interest1 through interest5 (individual tags, not pipe-separated),
    featured (a wikilink target) -->
<div class="bhf-profile">
<div class="bhf-profile__bio">{{{bio}}}</div>
<div class="bhf-profile__tags">{{#if:{{{interest1|}}}|<span class="bhf-profile__tag">{{{interest1}}}</span>}}{{#if:{{{interest2|}}}|<span class="bhf-profile__tag">{{{interest2}}}</span>}}{{#if:{{{interest3|}}}|<span class="bhf-profile__tag">{{{interest3}}}</span>}}{{#if:{{{interest4|}}}|<span class="bhf-profile__tag">{{{interest4}}}</span>}}{{#if:{{{interest5|}}}|<span class="bhf-profile__tag">{{{interest5}}}</span>}}</div>
<div id="bhf-contributor-stats" class="bhf-profile-stats"></div>
{{#if:{{{featured|}}}|<div class="bhf-profile__featured"><span class="bhf-profile__featured-label">Featured article</span>[[{{{featured}}}]]</div>}}
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/ContributorProfile.wikitext
git commit -m "feat: add contributor profile CSS and Template:ContributorProfile"
```

---

### Task 2: Pure contribution-stats functions

**Files:**
- Create: `src/contributor-stats.js`
- Create: `tests/contributor-stats.test.js`

**Interfaces:**
- Produces: `countDistinctArticles(contributions)` → number,
  `lastActiveDate(contributions)` → string | null,
  `countCitationTemplateUsages(wikitext)` → number,
  `sumCitationCounts(perPageCounts)` → number. `contributions` is a plain
  array of `{ title, timestamp }` objects — none of these functions touch
  `document`/`mw`/`fetch`. Exported via a guarded `module.exports` (same
  pattern as `src/discovery-rail.js` and `src/citation-badges.js`). Consumed
  by Task 3's bootstrap.

- [ ] **Step 1: Write the failing test**

```js
// tests/contributor-stats.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countDistinctArticles,
  lastActiveDate,
  countCitationTemplateUsages,
  sumCitationCounts,
} = require('../src/contributor-stats.js');

test('countDistinctArticles dedupes by title', () => {
  const contributions = [
    { title: 'Robert Renfro', timestamp: '2026-07-01T12:00:00Z' },
    { title: 'Robert Renfro', timestamp: '2026-06-15T09:00:00Z' },
    { title: 'Fort Nashborough', timestamp: '2026-06-28T09:30:00Z' },
  ];
  assert.equal(countDistinctArticles(contributions), 2);
});

test('countDistinctArticles returns 0 for an empty list', () => {
  assert.equal(countDistinctArticles([]), 0);
});

test('lastActiveDate returns the most recent timestamp regardless of array order', () => {
  const contributions = [
    { title: 'A', timestamp: '2026-06-15T09:00:00Z' },
    { title: 'B', timestamp: '2026-07-01T12:00:00Z' },
    { title: 'C', timestamp: '2026-06-28T09:30:00Z' },
  ];
  assert.equal(lastActiveDate(contributions), '2026-07-01T12:00:00Z');
});

test('lastActiveDate returns null for an empty list', () => {
  assert.equal(lastActiveDate([]), null);
});

test('countCitationTemplateUsages counts {{Citation instances in wikitext', () => {
  const wikitext = '== Sources ==\n{{Citation|title=A|type=book|confidence=verified}}\n{{Citation|title=B|type=archival|confidence=single-source}}';
  assert.equal(countCitationTemplateUsages(wikitext), 2);
});

test('countCitationTemplateUsages returns 0 when there are no citations', () => {
  assert.equal(countCitationTemplateUsages('Just some prose with no sources.'), 0);
});

test('countCitationTemplateUsages is case-insensitive on the template name', () => {
  assert.equal(
    countCitationTemplateUsages('{{citation|title=A|type=book|confidence=verified}}'),
    1
  );
});

test('sumCitationCounts sums an array of per-page counts', () => {
  assert.equal(sumCitationCounts([2, 0, 5, 1]), 8);
});

test('sumCitationCounts returns 0 for an empty array', () => {
  assert.equal(sumCitationCounts([]), 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/contributor-stats.test.js`
Expected: FAIL — `../src/contributor-stats.js` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```js
// src/contributor-stats.js
//
// Pure functions for computing contributor profile stats. No `document`/
// `mw`/`fetch` here — see contributor-stats.bootstrap.js for the API wiring.
// Kept separate so this file is unit-testable with plain Node, mirroring
// discovery-rail.js's and citation-badges.js's split.

function countDistinctArticles(contributions) {
	const titles = new Set( contributions.map( ( c ) => c.title ) );
	return titles.size;
}

function lastActiveDate(contributions) {
	if ( contributions.length === 0 ) {
		return null;
	}

	return contributions.reduce( ( latest, c ) => {
		return c.timestamp > latest ? c.timestamp : latest;
	}, contributions[ 0 ].timestamp );
}

function countCitationTemplateUsages(wikitext) {
	const matches = wikitext.match( /\{\{\s*Citation[|}]/gi );
	return matches ? matches.length : 0;
}

function sumCitationCounts(perPageCounts) {
	return perPageCounts.reduce( ( sum, count ) => sum + count, 0 );
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = {
		countDistinctArticles,
		lastActiveDate,
		countCitationTemplateUsages,
		sumCitationCounts,
	};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/contributor-stats.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/contributor-stats.js tests/contributor-stats.test.js
git commit -m "feat: add pure contribution-stats functions"
```

---

### Task 3: Bootstrap wiring

**Files:**
- Create: `src/contributor-stats.bootstrap.js`

**Interfaces:**
- Consumes: `countDistinctArticles`, `lastActiveDate`,
  `countCitationTemplateUsages`, `sumCitationCounts` from
  `src/contributor-stats.js` (Task 2).
- Produces: the script pasted into `MediaWiki:Citizen.js` (after
  `contributor-stats.js`'s contents). Not unit-tested here — needs a real
  browser DOM and `mw` global; covered by Task 5's smoke-test checklist.

- [ ] **Step 1: Write the bootstrap script**

```js
// src/contributor-stats.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly AFTER
// contributor-stats.js's contents (both share one flat global scope on the
// real page — no require()/import there). Order relative to the discovery
// rail's and citation badges' files doesn't matter, as long as
// contributor-stats.js precedes this file.

( function () {
	'use strict';

	function mountStats() {
		var mount = document.getElementById( 'bhf-contributor-stats' );
		var username = mw.config.get( 'wgRelevantUserName' );

		if ( !mount || !username ) {
			return;
		}

		var api = new mw.Api();

		api.get( {
			action: 'query',
			list: 'usercontribs',
			ucuser: username,
			uclimit: 50,
			ucprop: 'title|timestamp'
		} ).done( function ( data ) {
			var rows = ( data.query && data.query.usercontribs ) || [];
			var contributions = rows.map( function ( row ) {
				return { title: row.title, timestamp: row.timestamp };
			} );

			if ( contributions.length === 0 ) {
				return;
			}

			var articleCount = countDistinctArticles( contributions );
			var lastActive = lastActiveDate( contributions );
			var seen = {};
			var distinctTitles = [];

			contributions.forEach( function ( c ) {
				if ( !seen[ c.title ] ) {
					seen[ c.title ] = true;
					distinctTitles.push( c.title );
				}
			} );

			// usercontribs is already capped at 50 (uclimit above), so
			// distinctTitles.length is at most 50 — no separate cap needed
			// here. All distinct titles are fetched in ONE batched API call
			// (MediaWiki's prop=revisions accepts multiple `|`-joined
			// titles), not one call per page.
			api.get( {
				action: 'query',
				prop: 'revisions',
				titles: distinctTitles.join( '|' ),
				rvprop: 'content',
				rvslots: 'main'
			} ).done( function ( pageData ) {
				var pages = ( pageData.query && pageData.query.pages ) || {};
				var perPageCounts = Object.keys( pages ).map( function ( pageId ) {
					var page = pages[ pageId ];
					var revision = page.revisions && page.revisions[ 0 ];
					var content = revision && revision.slots && revision.slots.main &&
						revision.slots.main[ '*' ];
					return content ? countCitationTemplateUsages( content ) : 0;
				} );
				var citationCount = sumCitationCounts( perPageCounts );

				mount.textContent = articleCount + ' articles contributed · ' +
					citationCount + ' citations across your ' + distinctTitles.length +
					' most recently edited articles · last active ' + lastActive;
			} );
		} );
	}

	mw.loader.using( 'mediawiki.api' ).then( function () {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', mountStats );
		} else {
			mountStats();
		}
	} );
}() );
```

- [ ] **Step 2: Syntax sanity check**

Run: `node --check src/contributor-stats.bootstrap.js`
Expected: no output (syntax valid). This is a sanity check only — it does not
substitute for the manual browser verification in Task 5, since this file
needs the `mw` global that only exists on a real MediaWiki page.

- [ ] **Step 3: Commit**

```bash
git add src/contributor-stats.bootstrap.js
git commit -m "feat: add mw.Api bootstrap wiring for contributor stats"
```

---

### Task 4: Discovery rail — link contributor names, without nested anchors

**Files:**
- Modify: `src/discovery-rail.js`
- Modify: `tests/discovery-rail.test.js`
- Modify: `src/citizen-theme.css`

**Interfaces:**
- Consumes: `titleToUrl`, `escapeHtml` (already in `src/discovery-rail.js`
  from the base theme).
- Produces: `transformRecentChanges` now includes a `userUrl` field on each
  returned item; `renderCard` now renders `.bhf-rail-card` as a `<div>` (not
  an `<a>`) with two sibling links — `.bhf-rail-card__title` (article) and,
  when `item.userUrl` is present, `.bhf-rail-card__user-link` (contributor
  profile). This is a real HTML-structure change: the OLD structure wrapped
  the whole card in one `<a>`, which would make a second nested `<a>` invalid
  HTML — see this plan's Global Constraints for why.

- [ ] **Step 1: Write the failing test**

Replace the existing exact-match test (it needs updating since
`transformRecentChanges` now returns an extra `userUrl` field per item — the
old expected objects would no longer match):

```js
// Replace the existing test in tests/discovery-rail.test.js:
// test('transformRecentChanges maps the core API shape to card data', ...)
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
      userUrl: '/wiki/User%3ATKennedy',
    },
    {
      title: 'Fort Nashborough',
      timestamp: '2026-06-28T09:30:00Z',
      user: 'Contributor2',
      url: '/wiki/Fort_Nashborough',
      userUrl: '/wiki/User%3AContributor2',
    },
  ]);
});
```

Append two new tests:

```js
// append to tests/discovery-rail.test.js
test('renderCard links the contributor name to their profile when userUrl is present', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
    userUrl: '/wiki/User%3ATKennedy',
  });

  assert.match(html, /<a class="bhf-rail-card__user-link" href="\/wiki\/User%3ATKennedy">TKennedy<\/a>/);
  assert.match(html, /<div class="bhf-rail-card">/);
  assert.match(html, /<a class="bhf-rail-card__title" href="\/wiki\/Robert_Renfro">Robert Renfro<\/a>/);
});

test('renderCard does not produce nested anchors', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
    userUrl: '/wiki/User%3ATKennedy',
  });

  // The card wrapper must be a <div>, never an <a> — otherwise the
  // .bhf-rail-card__title and .bhf-rail-card__user-link anchors inside it
  // would be invalid nested <a> tags.
  assert.ok(!/^<a class="bhf-rail-card"/.test(html));
});
```

Also strengthen the existing Trending-use-case test (still passes with no
changes needed, since that test's input has no `userUrl` — but add one more
explicit assertion confirming the no-userUrl path truly has no nested link):

```js
// Add this assertion inside the existing test:
// test('renderCard omits the timestamp separator when timestamp is absent (Trending use case)', ...)
// after the existing two assert lines, add:
  assert.ok(!html.includes('bhf-rail-card__user-link'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/discovery-rail.test.js`
Expected: FAIL — the updated `transformRecentChanges` test fails (no
`userUrl` yet), the two new `renderCard` tests fail (`userUrl` not handled,
card still an `<a>` not a `<div>`).

- [ ] **Step 3: Update the implementation**

In `src/discovery-rail.js`, replace:

```js
function transformRecentChanges(apiResponse) {
	const changes = ( apiResponse.query && apiResponse.query.recentchanges ) || [];

	return changes.map( ( change ) => ( {
		title: change.title,
		timestamp: change.timestamp,
		user: change.user,
		url: titleToUrl( change.title ),
	} ) );
}
```

with:

```js
function transformRecentChanges(apiResponse) {
	const changes = ( apiResponse.query && apiResponse.query.recentchanges ) || [];

	return changes.map( ( change ) => ( {
		title: change.title,
		timestamp: change.timestamp,
		user: change.user,
		url: titleToUrl( change.title ),
		userUrl: titleToUrl( 'User:' + change.user ),
	} ) );
}
```

Replace:

```js
function renderCard(item) {
	return (
		'<a class="bhf-rail-card" href="' + escapeHtml( item.url ) + '">' +
		'<span class="bhf-rail-card__title">' + escapeHtml( item.title ) + '</span>' +
		'<span class="bhf-rail-card__meta">' + escapeHtml( item.user ) +
			( item.timestamp ? ' &middot; ' + escapeHtml( item.timestamp ) : '' ) +
		'</span>' +
		'</a>'
	);
}
```

with:

```js
function renderCard(item) {
	const userHtml = item.userUrl ?
		'<a class="bhf-rail-card__user-link" href="' + escapeHtml( item.userUrl ) + '">' + escapeHtml( item.user ) + '</a>' :
		escapeHtml( item.user );

	return (
		'<div class="bhf-rail-card">' +
		'<a class="bhf-rail-card__title" href="' + escapeHtml( item.url ) + '">' + escapeHtml( item.title ) + '</a>' +
		'<span class="bhf-rail-card__meta">' + userHtml +
			( item.timestamp ? ' &middot; ' + escapeHtml( item.timestamp ) : '' ) +
		'</span>' +
		'</div>'
	);
}
```

In `src/citizen-theme.css`, replace:

```css
.bhf-rail-card {
	display: flex;
	flex-direction: column;
	text-decoration: none;
	padding: 0.5rem;
	border-radius: 6px;
	background-color: var( --color-surface-0 );
}

.bhf-rail-card:hover {
	background-color: var( --color-surface-2 );
}

.bhf-rail-card__title {
	font-weight: 600;
	color: var( --color-emphasized );
}

.bhf-rail-card__meta {
	font-size: 0.8rem;
	color: var( --color-subtle );
}
```

with:

```css
.bhf-rail-card {
	display: flex;
	flex-direction: column;
	padding: 0.5rem;
	border-radius: 6px;
	background-color: var( --color-surface-0 );
}

.bhf-rail-card:hover {
	background-color: var( --color-surface-2 );
}

.bhf-rail-card__title {
	font-weight: 600;
	color: var( --color-emphasized );
	text-decoration: none;
}

.bhf-rail-card__title:hover {
	text-decoration: underline;
}

.bhf-rail-card__meta {
	font-size: 0.8rem;
	color: var( --color-subtle );
}

.bhf-rail-card__user-link {
	color: inherit;
	text-decoration: underline;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/discovery-rail.test.js`
Expected: PASS (all tests — the pre-existing "produces a card with title,
contributor, and relative-safe timestamp", "includes the timestamp when
present", "omits the timestamp separator... (Trending use case)", and
"escapes HTML..." tests all still pass unmodified, since none of their input
objects include `userUrl` and their assertions are tag-agnostic or check
substrings that remain true under the new structure)

- [ ] **Step 5: Commit**

```bash
git add src/discovery-rail.js tests/discovery-rail.test.js src/citizen-theme.css
git commit -m "feat: link discovery-rail contributor names to their profile, fixing nested-anchor HTML"
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
- [ ] A `User:` page with `{{ContributorProfile}}` shows the bio and up to 5
      interest tags
- [ ] A `User:` page with a `featured` article set shows the featured-article
      mini-card, linking to that article
- [ ] For a user with edit history, the stats line populates automatically
      with "N articles contributed", a citation count, and a last-active date
      — no manual entry required
- [ ] For a brand-new user with zero edits, the stats slot shows NOTHING (not
      a broken "0 articles" state)
- [ ] A "Recently Added" discovery-rail card's contributor name is a link to
      their `User:` page, and the article title is a SEPARATE link — clicking
      each goes to the right place, and the browser's dev tools show no
      nested `<a>` tags in that card's markup
- [ ] A Trending card (no `userUrl`) still shows its contributor/views text
      as plain, non-linked text
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for contributor profiles"
```

## Post-plan follow-ups (not part of this plan)

- Running the extended smoke test against a real MediaWiki + Citizen instance
  (same outstanding human follow-up as the base theme and citation tooling —
  no Docker in the environment this plan was authored in).
- Exact per-citation attribution, follower/social features, contributor
  leaderboards, or raising the 50-page citation-proxy cap all remain
  explicitly out of scope per the spec's "Open Items" section.
