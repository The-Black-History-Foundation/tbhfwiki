# Homepage Redesign — Design

**Date:** 2026-07-08
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

A first-time-visitor review of the live test wiki found that the single
biggest thing making the site feel like a default MediaWiki install isn't
our own content — it's Citizen's completely untouched sidebar, search box,
and personal-tools chrome, plus a homepage whose custom content (masthead,
hero, category strip) is conceptually right but visually thin, with no
narrative hook and no elevated search. This project redesigns the
homepage — including the parts of Citizen's chrome that surround it — to
feel like the front entrance to a museum, digital archive, and research
institute, while preserving every bit of real MediaWiki functionality
(search, navigation, account tools) underneath unchanged.

## First-Time-Visitor Findings (grounding this redesign)

- Page title and search placeholder both literally read "TBHF Wiki Test"
  (test-instance config bleeding through) — a real-deployment config fix,
  not a design change, noted here for completeness but out of this
  project's scope.
- Sidebar navigation, search box, and personal tools are 100% stock
  Citizen skin structure and wording — the strongest "default wiki" signal
  on the page.
- The homepage's own content (masthead, hero, category strip, footer) is
  functional but thin: one static featured article, four flat text-only
  category tiles, no mission/narrative content anywhere on the page
  itself.
- Search is present but not foregrounded — one item among header chrome,
  not a moment, on a site whose core value proposition is exploration and
  discovery.

## Scope

- `src/templates/MainPage.wikitext` — restructured section order and
  content: masthead → hero+search banner → mission section → discovery
  rail → category strip → footer band.
- `MediaWiki:Sidebar` (new) — re-labeled navigation groupings, real links
  only, no invented pages.
- Two new small interface-message pages (`MediaWiki:Explore-the-archive`,
  `MediaWiki:About-and-contribute`) supplying the sidebar's two section
  header labels.
- `src/citizen-theme.css` — new hero-banner, mission-band, richer
  discovery-rail card, and category-tile styling, plus a small shared
  spacing/type-scale token set used consistently across all of the above.
- Out of scope, explicitly: any change to `discovery-rail.js`,
  `discovery-rail.bootstrap.js`, `citation-badges.js`,
  `contributor-stats.js`, `research-leads.js`, or any other JS logic —
  this project is presentational only, per direct instruction not to add
  backend architecture unless it directly improves the visitor
  experience, and every question in this design resolved toward the
  no-new-mechanism option. Also out of scope: real `$wgSitename`
  configuration (a deployment-config fix, not a design decision),
  anything about the Evidence Explorer (paused, separate project), any
  non-homepage page's layout, the login/account chrome's own functionality
  (it inherits new styling only).

## Scope Decisions

**Reaching into Citizen's chrome:** in scope, deliberately — the sidebar
and search are the strongest signal of "default wiki install," so leaving
them untouched would undercut the redesign's actual goal. Both remain
functionally identical MediaWiki mechanisms underneath; only their content
(sidebar labels/grouping) and presentation (search box placement/styling)
change.

**Storytelling:** a short, condensed (~3 sentence) version of the About
page's existing "Why We Built It" narrative, added directly to the
homepage with a link to the full page — not a new rotating/curated
spotlight mechanism (that would require new logic to maintain, rejected in
favor of the simpler static option).

**Featured content:** the existing single-hero-article mechanism is kept
exactly as-is (still one manually-edited featured article via
`{{FEATURED_TITLE}}`/`{{FEATURED_EXCERPT}}`) and given a much stronger
visual treatment, rather than adding a second curated slot or a
rotation mechanism.

**Category tiles:** visual polish only (inline SVG icons, hover states) —
not real per-category article counts, which would require a new small JS
bootstrap querying the API. Rejected in favor of the simpler, purely
presentational option.

**Layout composition:** search is integrated directly into the hero
banner as one combined visual unit (featured article + search box
together), rather than a separate dedicated search section before the
hero, or leading with the mission narrative before the hero. This reads
most like a museum/research-institute "search the collection" front-door
moment.

## Hero + Search Banner

The centerpiece of the redesign — replaces today's plain two-column hero:

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

The search form posts to MediaWiki's real `Special:Search` via a plain
HTML GET form — no JavaScript required for it to function, no new backend
mechanism, identical underlying search to what Citizen's own box already
provides today, just our own visual container and placement. Visually: a
full-width banner with the featured article on one side (eyebrow label,
large Neue Kabel title, pull-quote-style excerpt) and the search panel
clearly weighted as its own gold-bordered action area, not a decoration —
stacking into a single column on narrow/mobile widths.

## Mission / "Why This Archive Exists" Section

```wikitext
<div class="bhf-mission-band">
<span class="bhf-mission-band__eyebrow">Why This Archive Exists</span>
<div class="bhf-mission-band__text">
In 1860, the community of Africatown told the story of the ''Clotilda'' for over a century before the outside world caught up. This archive exists to close that gap — to give community accounts, family memory, and oral history a place to be documented, discussed, and recognized, on their way to being proven.
</div>
[[About This Wiki|Read our full story →]]
</div>
```

Styled as a visually distinct band (a different surface tone or bordered
inset from the parchment above/below it) so it reads as a deliberate
pause/statement rather than blending into the surrounding content.

## Discovery Rail — Richer Card Treatment

No changes to `discovery-rail.js` or `discovery-rail.bootstrap.js` — same
real data, same DOM structure (`.bhf-rail-card`, `.bhf-rail-card__title`,
`.bhf-rail-card__user-link`, unchanged). CSS-only changes:

- Cards move from a stacked list to a responsive CSS grid.
- Each card gets a subtle gold-bordered shell (consistent with the
  infobox/pull-quote/hero-banner treatment), more generous internal
  spacing, and a clearer type hierarchy (Neue Kabel title, secondary/muted
  metadata line).
- Section headings ("Recently Added" / "Trending") get the same
  `__eyebrow`-style treatment as the hero banner and mission section.

## Category Tiles — Visual Polish

Same 4 tiles (People/Places/Events/Eras), same links and category
targets, richer presentation:

- Each tile gets a small inline SVG icon embedded directly in the
  wikitext/CSS — a silhouette for People, a building/map-pin mark for
  Places, a calendar/burst mark for Events, an hourglass/timeline mark for
  Eras. No external image files or uploads required.
- Real hover/focus states — a subtle lift or Firebrick Red border-color
  shift — so tiles read as clearly interactive.
- More generous sizing/spacing so these are genuine visual anchors, not a
  cramped afterthought row.

## Sidebar Navigation

New `MediaWiki:Sidebar` content, replacing Citizen's default groupings:

```wikitext
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

`MediaWiki:Explore-the-archive` = "Explore the Archive" and
`MediaWiki:About-and-contribute` = "About and Contribute" supply the two
section header labels (MediaWiki's interface-message mechanism — the
sidebar wikitext references message keys, not literal text, for
non-built-in section headers). `SEARCH` and `TOOLBOX` keep MediaWiki's own
built-in behavior and content unchanged. Every link target is a real,
already-existing page — nothing invented.

## Shared Spacing & Type-Scale Tokens

```css
--bhf-homepage-section-spacing: 3rem;
--bhf-eyebrow-font-size: 0.8rem;
--bhf-eyebrow-letter-spacing: 0.08em;
```

Every `__eyebrow`-style label (hero banner, mission section, discovery
rail headings) uses the same two eyebrow tokens; every top-level homepage
section uses the same spacing token between it and its neighbors, so the
page reads as one deliberately-composed surface. Scoped to the homepage's
new/modified sections only — not a project-wide typography refactor of
already-shipped components (infobox, citation/evidence tags, etc. are
untouched).

## Testing Plan

- `tests/citizen-theme.test.js` additions: `.bhf-hero-banner`,
  `.bhf-hero-banner__search-form`, `.bhf-mission-band`, category-tile
  hover-state rules, and the new spacing/eyebrow custom properties are all
  defined. The search form's hidden `title` input value is asserted to be
  exactly `Special:Search` (so a future edit can't silently break real
  search). Category tile icons are asserted to be inline SVG markup, not
  external `<img>`/file references.
- No changes to any test file covering `discovery-rail.js`,
  `citation-badges.js`, `contributor-stats.js`, or `research-leads.js` —
  confirmed none of their logic changes in this project.
- Manual smoke-test checklist additions: typing a query into the hero
  search box and submitting lands on real `Special:Search` results with
  actual matches; the sidebar shows "Explore the Archive" and "About and
  Contribute" groupings with every link working; category tiles show
  icons and hover feedback; the mission section's "Read our full story"
  link reaches the real About This Wiki page; resizing to mobile width
  stacks the hero banner's featured-article and search panels into a
  single column.

## Open Items for Future Phases (explicitly out of scope here)

- Real `$wgSitename` configuration for an actual deployment (not a design
  decision for this repo).
- Per-category real article counts on the category tiles (would require a
  new small JS bootstrap — rejected for this round in favor of visual
  polish only).
- A rotating/curated featured-content spotlight beyond the single
  existing hero article.
- Any redesign of non-homepage page layouts (articles, User: pages, the
  Research Leads board, About/Terms pages) — this project is the homepage
  only.
