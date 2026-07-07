# Source-Citation / "Verified Sources" Tooling — Design

**Date:** 2026-07-07
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

The Citizen theme (see `2026-07-06-black-history-wiki-skin-design.md`) shipped a gold
"Sources verified" badge slot, but it was purely cosmetic — an editor set a manual
`verified=1` parameter with nothing behind it. This project makes that badge (and a
new companion badge) actually mean something: a structured citation template that
captures what kind of source backs an article and how confident contributors are in
it, plus an automatic, always-accurate badge computed from real page content instead
of a flag that can drift.

This directly serves the wiki's research mission — a visitor should be able to tell,
at a glance, whether a claim is backed by sources at all, and whether a human
reviewer has separately signed off on those sources.

## Scope

- A wikitext citation template (`Template:Citation`) with structured fields: title,
  author, source type, publication/repository, date, location/link, and a
  contributor-assigned confidence rating.
- A new skin JS module that automatically computes two independent badge states by
  scanning the rendered page — no manual flags, no drift between claimed and actual
  state.
- CSS for the citation cards, confidence tags, and a new green "reviewer confirmed"
  badge (reusing the `--bhf-color-success` token defined but left unused in the prior
  project).
- Out of scope: any new MediaWiki extension (Scribunto, Cite, FlaggedRevs), any actual
  reviewer-identity or approval-workflow tracking, any change to how `<ref>`/Cite
  footnotes work. This stays in the same "on-wiki CSS/JS/wikitext only" pattern as the
  base theme.

## Scope Decision

Three levels of ambition were considered: (1) wikitext-only with a manual flag —
rejected because it doesn't solve the actual problem (badges that can be wrong); (2)
wikitext + lightweight category convention for review, with automatic detection via
skin JS — **chosen**; (3) a real reviewer workflow with accounts/approval state via a
MediaWiki extension — rejected as a much larger project, closer to a second full
build than a follow-on feature. Reviewer confirmation is a human editorial judgment
(adding `Category:Reviewed` to a page by hand) that the skin detects and displays, not
something the skin computes on its own — only "does this article cite sources at all"
is inferred automatically from content.

## Citation Template — `Template:Citation`

**Fields:**

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Source title or description |
| `author` | No | Author, creator, or interviewee — many archival/oral sources won't have one |
| `type` | Yes | One of: `archival`, `newspaper`, `book`, `oral-history`, `record`, `photo` (see Source Types below) |
| `publication` | No | Publisher, archive/repository name, or context |
| `date` | No | Date of the source itself |
| `location` | No | A URL, or a physical location (e.g. "Tennessee State Library and Archives, Box 12") |
| `confidence` | Yes | One of: `verified`, `single-source`, `disputed` (see Confidence Ratings below) |

### Source Types

Chosen to match the kind of evidence Black history research actually relies on,
broader than a generic primary/secondary split:

- `archival` — archival document (deeds, church records, registers)
- `newspaper` — newspaper or periodical
- `book` — book or published work
- `oral-history` — oral history or interview
- `record` — government or legal record
- `photo` — photograph or artifact

### Confidence Ratings

A 3-level scale, assigned by the contributor adding the citation:

- `verified` — corroborated by multiple sources
- `single-source` — one source only, not yet corroborated
- `disputed` — sources conflict, or accuracy is actively questioned

### Placement

Citations live in a standalone `== Sources ==` section using `{{Citation|...}}`
directly — **not** inside `<ref>`/`<references/>` footnotes. This avoids any
dependency on the Cite extension's behavior, and makes citations trivially countable
by the skin JS (no footnote-numbering interaction to reason about). It also produces
a clean bibliography section separate from inline prose, which fits research use
better than scattered footnotes for this kind of source-heavy article.

**Example usage:**

```wikitext
== Sources ==
{{Citation|title=Deed of manumission|type=archival|date=1779|location=Davidson County Register's Office|confidence=verified}}
{{Citation|title=Interview with descendant|type=oral-history|author=J. Smith|date=2019|confidence=single-source}}
```

**Rendering:** each citation becomes:

```html
<div class="bhf-citation bhf-citation--archival" data-confidence="verified">
  ...title, author, publication, date, location, type label, confidence tag...
</div>
```

## Badges

Two independent badges, both reusing the existing pill-badge shell
(`.bhf-badge--verified`'s shape: rounded, filled background, small text):

- **Gold "Sources cited"** — reuses the existing `.bhf-badge--verified` CSS class and
  gold-fill/espresso-text pattern already built. Shows when the page has ≥1
  `.bhf-citation` element. Label text changes from the old generic "Sources verified"
  to "Sources cited" to accurately describe what's being detected (presence, not
  quality).
- **Green "Reviewer confirmed"** — new `.bhf-badge--reviewed` class, same pill shape,
  filled with `--bhf-color-success` (`#3B5C40`) and parchment-colored text. Shows when
  the page's category links include `Category:Reviewed`. Both badges can appear
  together, independently, or neither — an article can be sourced but not yet
  reviewed, reviewed despite thin sourcing (unlikely but not prevented), or both.

Both badges render into the existing breadcrumb slot (`ArticleBreadcrumb.wikitext`,
from the base theme). **This replaces** that template's old manual `verified`
parameter — the badge now comes from JS-injected markup, not a wikitext flag. If a
page still passes the old `verified=1` parameter, it is silently ignored (harmless
dead parameter, not an error) — no migration script is needed since this is a design
choice for new/edited pages going forward, not a data migration project.

**Confidence tags** on individual citations (not the article-level badges) reuse the
same three-color logic: green for `verified`, neutral grey for `single-source`,
terracotta for `disputed` — sized smaller than the article-level badges so they read
as metadata rather than headline claims. No new colors are introduced; all three are
already in the palette.

**Badges are independent of citation confidence.** A single `disputed` citation does
not suppress the gold badge — the article still has ≥1 cited source, which is exactly
what the gold badge claims. Disputed sources remain visible in the Sources list
itself via their confidence tag.

## JS Module — `src/citation-badges.js` + bootstrap

Follows the exact pattern already established by `discovery-rail.js` /
`discovery-rail.bootstrap.js` in the base theme:

- **Pure functions** in `src/citation-badges.js`, unit-tested with Node's built-in
  test runner (no `mw`/`fetch`/DOM-API dependency beyond a passed-in `document`-like
  object, so they're testable with plain DOM fixtures — mirroring how
  `discovery-rail.js` keeps `mw.Api` wiring separate from testable logic):
  - `countCitations(citationElements)` → number — returns `citationElements.length`.
    Takes an array-like list (the bootstrap passes the real result of
    `document.querySelectorAll('.bhf-citation')`; tests pass a plain array of stub
    objects) — the function itself never touches `document` or any DOM API.
  - `hasReviewedCategory(categoryLinkTitles)` → boolean — takes a plain array of
    strings (the bootstrap passes the `title` attribute of each anchor under
    `#catlinks`; tests pass a plain string array) and returns whether any entry
    contains `"Category:Reviewed"`.
  - `buildBadgeHtml({ hasSources, isReviewed })` → HTML string — returns the badge
    markup for whichever combination applies (both, gold-only, green-only, or empty
    string if neither).
  - Guarded `module.exports` (same `if (typeof module !== 'undefined')` pattern as
    `discovery-rail.js`), since this file also gets pasted into the browser-only
    `MediaWiki:Citizen.js`.
- **Thin bootstrap** in `src/citation-badges.bootstrap.js`: on page load, calls
  `document.querySelectorAll` for the citation list and the `#catlinks` element,
  passes them to the pure functions, and injects the resulting HTML into the
  breadcrumb slot's badge container. Not unit-tested (needs a real browser DOM) —
  covered by the same manual smoke-test pattern as the base theme's discovery rail.
- **No-JS fallback:** the breadcrumb badge slot renders empty until JS runs. This is
  an accepted tradeoff (matches the "automatic via skin JS" scope decision above), not
  a defect — a page without JS shows no badges rather than stale/wrong ones.

## Testing / Validation Plan

- Unit tests (`node --test`) for `countCitations`, `hasReviewedCategory`, and
  `buildBadgeHtml` against constructed DOM-fixture-style objects (plain objects/arrays
  simulating `querySelectorAll` results — no real DOM/jsdom dependency, consistent
  with this project's zero-npm-dependency constraint).
- CSS tests (`node --test` against `citizen-theme.css`, same regex-over-real-file
  pattern as the base theme) for `.bhf-citation`, `.bhf-citation--*` type variants,
  confidence tag colors, and `.bhf-badge--reviewed`.
- WCAG AA contrast check for green-fill/parchment-text (reusing already-validated
  forest-green-on-parchment contrast from the base theme's palette) and confirming
  the grey "single-source" tag meets AA against its background.
- Manual smoke test (extending the existing checklist): a test article with 0
  citations shows neither badge; with citations but no `Category:Reviewed` shows gold
  only; in `Category:Reviewed` with citations shows both; a `disputed` citation still
  shows the gold badge but displays its terracotta confidence tag.

## Open Items for Future Phases (explicitly out of scope here)

- Any real reviewer-identity/approval-workflow tracking (deferred per the Scope
  Decision above).
- Migrating existing pages' old manual `verified=1` parameter usage to the new
  automatic system (not needed — old parameter is silently ignored, not broken).
- Citation-count or confidence-mix analytics/reporting.
