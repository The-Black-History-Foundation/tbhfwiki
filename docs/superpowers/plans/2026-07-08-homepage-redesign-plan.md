# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage (and the Citizen skin chrome directly
around it) so it reads as the front entrance to a museum/archive/research
institute instead of a default MediaWiki install, while every underlying
MediaWiki mechanism (search, navigation, account tools) keeps working
exactly as before.

**Architecture:** Purely presentational — new/restructured wikitext
content in `MainPage.wikitext`, new `MediaWiki:Sidebar` content, and CSS
additions to `src/citizen-theme.css`. No JS logic changes anywhere in this
plan.

**Tech Stack:** MediaWiki wikitext, a plain HTML `<form>` posting to
MediaWiki's real `Special:Search` (no JS required for search to function),
inline SVG icons (no external image files), Node's built-in test runner
for CSS assertions.

## Global Constraints

- No changes to `discovery-rail.js`, `discovery-rail.bootstrap.js`,
  `citation-badges.js`, `contributor-stats.js`, or `research-leads.js` —
  this plan is presentational only.
- The search form's hidden `title` input must be exactly `Special:Search`
  — this is what makes the box real MediaWiki search, not decoration.
- Every sidebar link target must be a real, already-existing page — no
  invented links.
- New shared tokens (`--bhf-homepage-section-spacing`,
  `--bhf-eyebrow-font-size`, `--bhf-eyebrow-letter-spacing`) are scoped to
  the homepage's new/modified sections only — do not touch already-shipped
  component CSS (infobox, citation/evidence tags, pull-quote, etc.).
- Category tile icons are inline SVG embedded directly in the wikitext/CSS
  — no external image files, no uploads required.

---

### Task 1: Shared spacing/eyebrow tokens

**Files:**
- Modify: `src/citizen-theme.css:106-107` (end of the `:root` block)
- Modify: `tests/citizen-theme.test.js` (append)

**Interfaces:**
- Produces: `--bhf-homepage-section-spacing`, `--bhf-eyebrow-font-size`,
  `--bhf-eyebrow-letter-spacing`, consumed by Tasks 2-5's `__eyebrow`-style
  labels and section spacing.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines shared homepage spacing and eyebrow-label tokens', () => {
  assert.match(css, /--bhf-homepage-section-spacing:\s*3rem/);
  assert.match(css, /--bhf-eyebrow-font-size:\s*0\.8rem/);
  assert.match(css, /--bhf-eyebrow-letter-spacing:\s*0\.08em/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — tokens not defined yet.

- [ ] **Step 3: Add the tokens**

In `src/citizen-theme.css`, replace:

```css
	--color-surface-0: #F4EDE1;
	--color-surface-1: #FBF7EF;
	--color-surface-2: #F3ECDD;
	--color-base: #2A1D14;
	--color-emphasized: #2A1D14;
	--border-color-base: #D9CBB4;
}
```

with:

```css
	--color-surface-0: #F4EDE1;
	--color-surface-1: #FBF7EF;
	--color-surface-2: #F3ECDD;
	--color-base: #2A1D14;
	--color-emphasized: #2A1D14;
	--border-color-base: #D9CBB4;

	/* Homepage-redesign-only tokens — shared vertical rhythm and
	 * "eyebrow" label styling across the hero banner, mission section,
	 * and discovery rail headings. Not used by any already-shipped
	 * component (infobox, citation/evidence tags, pull-quote, etc.). */
	--bhf-homepage-section-spacing: 3rem;
	--bhf-eyebrow-font-size: 0.8rem;
	--bhf-eyebrow-letter-spacing: 0.08em;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add shared homepage spacing and eyebrow-label tokens"
```

---

### Task 2: Hero + search banner

**Files:**
- Modify: `src/citizen-theme.css:133-152` (replace `.bhf-hero`/`.bhf-hero img`/`.bhf-hero__title`) and `:245-253` (the mobile `@media` block for `.bhf-hero`)
- Modify: `tests/citizen-theme.test.js` (append)
- Modify: `src/templates/MainPage.wikitext:8-15` (replace the hero `<div>`)

**Interfaces:**
- Consumes: `--bhf-eyebrow-font-size`, `--bhf-eyebrow-letter-spacing` from Task 1.
- Produces: `.bhf-hero-banner`, `.bhf-hero-banner__content`,
  `.bhf-hero-banner__eyebrow`, `.bhf-hero-banner__title`,
  `.bhf-hero-banner__excerpt`, `.bhf-hero-banner__search`,
  `.bhf-hero-banner__search-label`, `.bhf-hero-banner__search-form`,
  `.bhf-hero-banner__search-input`, `.bhf-hero-banner__search-button`.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the hero banner with a real MediaWiki search form', () => {
  const block = css.match(/\.bhf-hero-banner\s*{[^}]*}/s)[0];
  assert.match(block, /display:\s*flex/);

  assert.match(css, /\.bhf-hero-banner__eyebrow\s*{[^}]*font-size:\s*var\(\s*--bhf-eyebrow-font-size\s*\)/s);
  assert.match(css, /\.bhf-hero-banner__search-form\s*{[^}]*}/s);
});

test('the hero banner search form targets real Special:Search', () => {
  const mainPage = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'templates', 'MainPage.wikitext'),
    'utf8'
  );
  assert.match(mainPage, /<input type="hidden" name="title" value="Special:Search">/);
  assert.match(mainPage, /<form action="\/index\.php" method="get"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-hero-banner` and the search form don't exist yet.

- [ ] **Step 3: Replace the hero CSS**

In `src/citizen-theme.css`, replace:

```css
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
```

with:

```css
.bhf-hero-banner {
	display: flex;
	gap: 2rem;
	align-items: stretch;
	background-color: var( --color-surface-1 );
	border: 1px solid var( --border-color-base );
	border-radius: 8px;
	padding: 2rem;
	margin-block: var( --bhf-homepage-section-spacing );
}

.bhf-hero-banner__content {
	flex: 2 1 0;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.bhf-hero-banner__content img {
	max-width: 100%;
	border-radius: 6px;
}

.bhf-hero-banner__eyebrow {
	font-family: var( --font-family-citizen-base );
	font-size: var( --bhf-eyebrow-font-size );
	letter-spacing: var( --bhf-eyebrow-letter-spacing );
	text-transform: uppercase;
	color: var( --bhf-color-accent-terracotta );
	font-weight: 700;
}

.bhf-hero-banner__title {
	font-family: var( --font-family-citizen-serif );
	font-size: 2rem;
}

.bhf-hero-banner__excerpt {
	font-style: italic;
	border-left: 3px solid var( --bhf-color-accent-gold );
	padding-left: 1rem;
}

.bhf-hero-banner__search {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 0.75rem;
	background-color: var( --color-surface-0 );
	border: 1px solid var( --bhf-color-accent-gold );
	border-radius: 8px;
	padding: 1.5rem;
}

.bhf-hero-banner__search-label {
	font-family: var( --font-family-citizen-base );
	font-size: var( --bhf-eyebrow-font-size );
	letter-spacing: var( --bhf-eyebrow-letter-spacing );
	text-transform: uppercase;
	font-weight: 700;
}

.bhf-hero-banner__search-form {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.bhf-hero-banner__search-input {
	padding: 0.6rem 0.75rem;
	border: 1px solid var( --border-color-base );
	border-radius: 6px;
	font-size: 1rem;
}

.bhf-hero-banner__search-button {
	background-color: var( --bhf-color-accent-gold );
	color: var( --bhf-color-text-on-gold );
	border: none;
	border-radius: 6px;
	padding: 0.6rem 1rem;
	font-weight: 600;
	cursor: pointer;
}
```

Then, in the same file, replace the mobile `@media` block:

```css
@media ( max-width: 640px ) {
	.bhf-hero {
		flex-direction: column;
	}

	.bhf-hero img {
		max-width: 100%;
	}
}
```

with:

```css
@media ( max-width: 640px ) {
	.bhf-hero-banner {
		flex-direction: column;
	}
}
```

- [ ] **Step 4: Update the Main Page template**

In `src/templates/MainPage.wikitext`, replace:

```wikitext
<div class="bhf-hero">
[[File:Featured-placeholder.jpg|thumb|none]]
<div>
<span class="bhf-hero__title">{{FEATURED_TITLE}}</span>

{{FEATURED_EXCERPT}}
</div>
</div>
```

with:

```wikitext
<div class="bhf-hero-banner bhf-texture-parchment">
<div class="bhf-hero-banner__content">
[[File:Featured-placeholder.jpg|thumb|none]]
<span class="bhf-hero-banner__eyebrow">Featured Research</span>
<span class="bhf-hero-banner__title">{{FEATURED_TITLE}}</span>
<div class="bhf-hero-banner__excerpt">{{FEATURED_EXCERPT}}</div>
</div>
<div class="bhf-hero-banner__search">
<span class="bhf-hero-banner__search-label">Explore the Archive</span>
<form action="/index.php" method="get" class="bhf-hero-banner__search-form">
<input type="hidden" name="title" value="Special:Search">
<input type="search" name="search" placeholder="Search people, places, events…" class="bhf-hero-banner__search-input">
<button type="submit" class="bhf-hero-banner__search-button">Search</button>
</form>
</div>
</div>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/MainPage.wikitext
git commit -m "feat: redesign the hero into a combined featured-article + search banner"
```

---

### Task 3: Mission section

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Modify: `src/templates/MainPage.wikitext` (insert after the hero banner)

**Interfaces:**
- Consumes: `--bhf-eyebrow-font-size`, `--bhf-eyebrow-letter-spacing`, `--bhf-homepage-section-spacing` from Task 1.
- Produces: `.bhf-mission-band`, `.bhf-mission-band__eyebrow`, `.bhf-mission-band__text`.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the mission band with a distinct surface from the parchment page background', () => {
  const block = css.match(/\.bhf-mission-band\s*{[^}]*}/s)[0];
  assert.match(block, /background-color:\s*var\(\s*--color-surface-2\s*\)/);
  assert.match(block, /margin-block:\s*var\(\s*--bhf-homepage-section-spacing\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-mission-band` not defined yet.

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

.bhf-mission-band {
	background-color: var( --color-surface-2 );
	border-radius: 8px;
	padding: 2rem;
	margin-block: var( --bhf-homepage-section-spacing );
	text-align: center;
}

.bhf-mission-band__eyebrow {
	display: block;
	font-family: var( --font-family-citizen-base );
	font-size: var( --bhf-eyebrow-font-size );
	letter-spacing: var( --bhf-eyebrow-letter-spacing );
	text-transform: uppercase;
	color: var( --bhf-color-accent-terracotta );
	font-weight: 700;
	margin-bottom: 0.75rem;
}

.bhf-mission-band__text {
	max-width: 640px;
	margin-inline: auto;
	font-family: var( --font-family-citizen-serif );
	font-size: 1.1rem;
	line-height: 1.6;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Insert the mission section into the Main Page**

In `src/templates/MainPage.wikitext`, replace:

```wikitext
</div>

<div id="bhf-discovery-rail"></div>
<!-- populated client-side by discovery-rail.bootstrap.js, see Task 5-7 -->
```

(this is the closing `</div>` of the hero banner immediately followed by the discovery-rail placeholder) with:

```wikitext
</div>

<div class="bhf-mission-band">
<span class="bhf-mission-band__eyebrow">Why This Archive Exists</span>
<div class="bhf-mission-band__text">
In 1860, the community of Africatown told the story of the ''Clotilda'' for over a century before the outside world caught up. This archive exists to close that gap — to give community accounts, family memory, and oral history a place to be documented, discussed, and recognized, on their way to being proven.
</div>
[[About This Wiki|Read our full story →]]
</div>

<div id="bhf-discovery-rail"></div>
<!-- populated client-side by discovery-rail.bootstrap.js, see Task 5-7 -->
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/MainPage.wikitext
git commit -m "feat: add the mission/storytelling section to the homepage"
```

---

### Task 4: Discovery rail — richer card grid

**Files:**
- Modify: `src/citizen-theme.css:195-233` (the `.bhf-rail__column h2` through `.bhf-rail-card__user-link` rules)
- Modify: `tests/citizen-theme.test.js` (append)

**Interfaces:**
- Consumes: `--bhf-eyebrow-font-size`, `--bhf-eyebrow-letter-spacing` from Task 1.
- No changes to `discovery-rail.js`/`.bootstrap.js` — same class names
  (`.bhf-rail-card`, `.bhf-rail-card__title`, `.bhf-rail-card__meta`,
  `.bhf-rail-card__user-link`) as already produced by the existing
  bootstrap.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('discovery rail section headings use the shared eyebrow treatment', () => {
  const block = css.match(/\.bhf-rail__column h2\s*{[^}]*}/s)[0];
  assert.match(block, /font-size:\s*var\(\s*--bhf-eyebrow-font-size\s*\)/);
  assert.match(block, /letter-spacing:\s*var\(\s*--bhf-eyebrow-letter-spacing\s*\)/);
});

test('discovery rail cards render as a responsive grid with a gold-bordered shell', () => {
  const cardsBlock = css.match(/\.bhf-rail__cards\s*{[^}]*}/s)[0];
  assert.match(cardsBlock, /display:\s*grid/);

  const cardBlock = css.match(/\.bhf-rail-card\s*{[^}]*}/s)[0];
  assert.match(cardBlock, /border:.*var\(\s*--bhf-color-accent-gold\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — headings don't use eyebrow tokens yet, `.bhf-rail__cards` is still a flex column, `.bhf-rail-card` has no gold border.

- [ ] **Step 3: Replace the CSS**

In `src/citizen-theme.css`, replace:

```css
.bhf-rail__column h2 {
	font-family: var( --font-family-citizen-serif );
	font-size: 1.1rem;
	margin-top: 0;
}

.bhf-rail__cards {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

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

with:

```css
.bhf-rail__column h2 {
	font-family: var( --font-family-citizen-base );
	font-size: var( --bhf-eyebrow-font-size );
	letter-spacing: var( --bhf-eyebrow-letter-spacing );
	text-transform: uppercase;
	font-weight: 700;
	color: var( --bhf-color-accent-terracotta );
	margin-top: 0;
}

.bhf-rail__cards {
	display: grid;
	grid-template-columns: repeat( auto-fill, minmax( 200px, 1fr ) );
	gap: 0.75rem;
}

.bhf-rail-card {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	padding: 1rem;
	border-radius: 8px;
	border: 1px solid var( --bhf-color-accent-gold );
	background-color: var( --color-surface-0 );
}

.bhf-rail-card:hover {
	background-color: var( --color-surface-2 );
}

.bhf-rail-card__title {
	font-family: var( --font-family-citizen-serif );
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

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: restyle the discovery rail into a richer card grid"
```

---

### Task 5: Category tiles — icons and hover states

**Files:**
- Modify: `src/citizen-theme.css:161-174` (replace `.bhf-category-tile`/`.bhf-category-tile:hover`)
- Modify: `tests/citizen-theme.test.js` (append)
- Modify: `src/templates/MainPage.wikitext` (replace the category strip)

**Interfaces:**
- Produces: `.bhf-category-tile__icon`, updated `.bhf-category-tile` (larger, with a real `:hover`/`:focus` transform), consumed only by this task's own wikitext.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('category tiles have a real interactive hover/focus state and room for an icon', () => {
  const block = css.match(/\.bhf-category-tile\s*{[^}]*}/s)[0];
  assert.match(block, /padding:\s*1\.5rem/);

  const hoverBlock = css.match(/\.bhf-category-tile:hover,?\s*\.bhf-category-tile:focus\s*{[^}]*}/s)[0];
  assert.match(hoverBlock, /transform:/);

  assert.match(css, /\.bhf-category-tile__icon\s*{[^}]*}/s);
});

test('category tile icons are inline SVG, not external image files', () => {
  const mainPage = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'templates', 'MainPage.wikitext'),
    'utf8'
  );
  assert.match(mainPage, /<svg[^>]*class="bhf-category-tile__icon"/);
  assert.ok(!mainPage.includes('[[File:People-icon'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — no icon class, no real hover transform, no inline SVGs in the wikitext yet.

- [ ] **Step 3: Replace the CSS**

In `src/citizen-theme.css`, replace:

```css
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
```

with:

```css
.bhf-category-tile {
	background-color: var( --bhf-color-accent-gold );
	color: var( --bhf-color-text-on-gold );
	text-align: center;
	padding: 1.5rem;
	border-radius: 8px;
	font-weight: 600;
	text-decoration: none;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	transition: transform 0.15s ease, filter 0.15s ease;
}

.bhf-category-tile:hover,
.bhf-category-tile:focus {
	filter: brightness( 1.08 );
	transform: translateY( -2px );
}

.bhf-category-tile__icon {
	width: 32px;
	height: 32px;
	fill: currentColor;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Update the category strip in the Main Page**

In `src/templates/MainPage.wikitext`, replace:

```wikitext
<div class="bhf-category-strip">
[[:Category:People|<div class="bhf-category-tile">People</div>]]
[[:Category:Places|<div class="bhf-category-tile">Places</div>]]
[[:Category:Events|<div class="bhf-category-tile">Events</div>]]
[[:Category:Eras|<div class="bhf-category-tile">Eras</div>]]
</div>
```

with:

```wikitext
<div class="bhf-category-strip">
[[:Category:People|<div class="bhf-category-tile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="bhf-category-tile__icon"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>People</div>]]
[[:Category:Places|<div class="bhf-category-tile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="bhf-category-tile__icon"><path d="M12 2C8 2 5 5 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="var(--bhf-color-accent-gold)"/></svg>Places</div>]]
[[:Category:Events|<div class="bhf-category-tile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="bhf-category-tile__icon"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>Events</div>]]
[[:Category:Eras|<div class="bhf-category-tile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="bhf-category-tile__icon"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>Eras</div>]]
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/MainPage.wikitext
git commit -m "feat: add inline SVG icons and real hover states to category tiles"
```

---

### Task 6: Sidebar navigation

**Files:**
- Create: `src/Sidebar.wikitext`
- Create: `src/Explore-the-archive.wikitext`
- Create: `src/About-and-contribute.wikitext`
- Modify: `README.md` (templates table)

**Interfaces:**
- Consumes: real existing pages only (`Main Page`, `Special:Random`,
  `Research Leads`, `Special:Categories`, `About This Wiki`,
  `Help:Contributing`, `Special:CreateAccount`, `Terms of Use`) — no new
  pages created by this task.

- [ ] **Step 1: Write the Sidebar content**

```wikitext
<!-- src/Sidebar.wikitext — paste as MediaWiki:Sidebar -->
* explore-the-archive
** Main Page|mainpage-description
** Special:Random|Random Article
** Research Leads|Research Leads
** Special:Categories|Browse by Category
* about-and-contribute
** About This Wiki|About This Wiki
** Help:Contributing|Contribute
** Special:CreateAccount|Join the Project
** Terms of Use|Terms of Use
* SEARCH
* TOOLBOX
```

- [ ] **Step 2: Write the two interface-message pages**

```wikitext
<!-- src/Explore-the-archive.wikitext — paste as MediaWiki:Explore-the-archive
    (supplies the display text for the Sidebar.wikitext section header
    keyed "explore-the-archive") -->
Explore the Archive
```

```wikitext
<!-- src/About-and-contribute.wikitext — paste as MediaWiki:About-and-contribute
    (supplies the display text for the Sidebar.wikitext section header
    keyed "about-and-contribute") -->
About and Contribute
```

- [ ] **Step 3: Update the README's template table**

In `README.md`, replace:

```markdown
| `AboutProject.wikitext` | A page titled `About This Wiki` |
| `TermsOfUse.wikitext` | A page titled `Terms of Use` |

### Optional extensions
```

with:

```markdown
| `AboutProject.wikitext` | A page titled `About This Wiki` |
| `TermsOfUse.wikitext` | A page titled `Terms of Use` |
| `Sidebar.wikitext` | `MediaWiki:Sidebar` |
| `Explore-the-archive.wikitext` | `MediaWiki:Explore-the-archive` |
| `About-and-contribute.wikitext` | `MediaWiki:About-and-contribute` |

### Optional extensions
```

- [ ] **Step 4: Commit**

```bash
git add src/Sidebar.wikitext src/Explore-the-archive.wikitext src/About-and-contribute.wikitext README.md
git commit -m "feat: re-label sidebar navigation for the homepage redesign"
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
## Homepage redesign

- [ ] The hero banner shows the featured article and a search panel side
      by side (stacked on mobile widths)
- [ ] Typing a query into the hero search box and submitting lands on
      real `Special:Search` results with actual matches — not a broken
      link or a 404
- [ ] The "Why This Archive Exists" mission band renders between the hero
      banner and the discovery rail, and its "Read our full story" link
      reaches the real "About This Wiki" page
- [ ] Discovery rail cards render as a grid (not a single stacked column)
      on desktop widths, each with a visible gold border
- [ ] Category tiles show an icon above the label, and a hover/focus state
      that visibly lifts the tile (not just a color change)
- [ ] The sidebar shows "Explore the Archive" and "About and Contribute"
      section headings (not MediaWiki's default "Navigation")
- [ ] Every sidebar link under both new sections goes to a working page
      (no red links, no 404s)
- [ ] The sidebar's Search and Tools sections still work exactly as
      before (unaffected by this redesign)
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for the homepage redesign"
```

## Post-plan follow-ups (not part of this plan)

- Actually uploading nothing new is required for this plan (no new binary
  assets) — but running the extended smoke-test checklist against a real
  MediaWiki + Citizen instance is still an outstanding human follow-up,
  same as every earlier feature.
- Real `$wgSitename` configuration for an actual deployment (a
  deployment-config fix, not part of this repo's deliverable).
- Per-category real article counts, a rotating featured-content spotlight,
  and any non-homepage page redesign — all explicitly out of scope per
  the spec.
