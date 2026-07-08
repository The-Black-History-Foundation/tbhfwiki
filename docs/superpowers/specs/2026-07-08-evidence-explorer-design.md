# Evidence Explorer — Design

**Date:** 2026-07-08
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

Replace the flat, bottom-of-article citation list with a collapsible
**Evidence panel** that organizes every source on a page into a richer,
12-category taxonomy — closing the gap between "a source is cited
somewhere" and "a reader can actually see what kind of evidence backs this
article, and how much of it there is." This retires and replaces the
existing `{{Citation}}` template/taxonomy rather than running two systems
side by side.

## Scope

- `src/templates/Evidence.wikitext` — replaces `Citation.wikitext`, with
  an expanded field set and 12-value type taxonomy (see below).
- `src/evidence-panel.js` (pure) + `src/evidence-panel.bootstrap.js`
  (browser-only) — new pair, following this project's established
  pure-function/bootstrap pattern.
- An update to `src/citation-badges.js` so the existing "Sources cited" /
  "Reviewer confirmed" badges keep working, now counting `{{Evidence}}`
  entries instead of `{{Citation}}` entries.
- New CSS under a `bhf-evidence` BEM root, added to `src/citizen-theme.css`.
- Migration of this repo's existing sample content
  (`Robert "Black Bob" Renfro`, `Fort Nashborough` articles and their
  `{{Citation}}` usages) to `{{Evidence}}`.
- Out of scope, explicitly: any AI-assisted source suggestion, extraction,
  or classification (per direct instruction — "do not implement AI yet");
  actual digital-scan upload/viewing (only an inert, reserved `scanUrl`
  field); any change to the Reliability *values* themselves beyond
  renaming `confidence` → `reliability`; a dedicated `Evidence:` namespace
  (entries live inline in articles, same as `{{Citation}}` did).

## Category Taxonomy

Two-level hierarchy. A source's `type=` value is always one of these 12
leaf values — `Primary Documents` is both a parent-grouping label in the
panel AND a valid catch-all leaf type for a source that doesn't fit one of
its five specific children:

```
Primary Documents        (catch-all leaf, AND parent of the next five)
├─ Government Records
├─ Land Records
├─ Military Records
├─ Maps
└─ Letters

Newspapers
Books
Academic Papers
Oral Histories
DNA Studies
Archaeology
```

Display order in the panel is exactly this list — Primary Documents (with
its five children nested inside it) first, then the six standalone
categories in the order shown above. Categories with zero sources on a
given page are omitted entirely, not shown as empty headings.

## `Evidence.wikitext` — Template

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

The category tag is wrapped in `<includeonly>` from the start — the exact
fix Task learned the hard way on `Template:ResearchLead` (see commit
`ab302d2`): without it, viewing `Template:Evidence` itself would
categorize the template page as if it were a real source.

Every field is stored **both** as a `data-evidence-*` attribute (for
reliable JS extraction — no fragile text-node scraping) and as visible
text (so the entry is fully readable with JS disabled, exactly where the
editor placed it in the article, e.g. under `== Sources ==`).

## Panel Placement & Behavior

Article templates add `<div id="bhf-evidence-panel"></div>` once,
typically right after `{{ArticleBreadcrumb}}` and before the body — the
same placeholder-div pattern the discovery rail and leads board already
use.

`evidence-panel.bootstrap.js`, on page load:

1. Finds all `.bhf-evidence-entry` elements already rendered inline on the
   page.
2. If there are zero, does nothing — no panel is injected, matching the
   existing citation-badge "no badge if no citations" convention.
3. Otherwise, reads each entry's `data-evidence-*` attributes, groups them
   via the pure `groupEvidenceByCategory()` function, renders the panel
   via `renderEvidencePanel()`, and injects the result into
   `#bhf-evidence-panel`.
4. **Hides the original inline entries** once the panel is successfully
   injected, so a JS-enabled reader sees each source exactly once (in the
   organized panel), while a JS-disabled reader still sees the plain
   inline list exactly where the editor placed it (never hidden, since the
   hiding code never ran). This was caught and corrected during design
   review — the first draft would have shown every source twice to
   JS-enabled readers.

The panel itself is a native `<details><summary>Evidence (N sources)</summary>...</details>` element — the collapse/expand toggle works with
zero JS; only the category-grouping requires JS. `N` is the total entry
count across every category. Categories are not independently collapsible
— once the panel is open, every non-empty category is visible together.

## Pure Functions (`src/evidence-panel.js`)

- `EVIDENCE_HIERARCHY` — the fixed taxonomy structure and display order
  from the Category Taxonomy section above, as a data constant.
- `groupEvidenceByCategory(entries)` — takes an array of
  `{title, type, date, repository, reliability, citation}` objects,
  returns them bucketed into the display structure (Primary Documents'
  direct entries + its five children as subgroups, then the six
  standalone categories), in the fixed display order, with empty
  categories and subcategories omitted entirely regardless of input
  order.
- `renderEvidencePanel(groups)` — takes the grouped structure and returns
  the `<details>` HTML string, with per-field HTML-escaping (reusing this
  project's established `escapeHtml` duplication-per-module convention for
  load-order independence).
- `countEvidenceEntries(entries)` — total count for the `<summary>` text
  and for `citation-badges.js`'s badge logic to reuse.

## `citation-badges.js` Update

- `citation-badges.js`'s `countCitations()` is renamed to
  `countEvidenceEntries()` and re-pointed at `.bhf-evidence-entry` instead
  of `.bhf-citation` — a separate, small copy of the same-named function
  in `evidence-panel.js`, consistent with this project's established
  convention of duplicating small utilities per module for load-order
  independence (the same reasoning already applied to `escapeHtml` and
  `titleToUrl` across `discovery-rail.js`/`research-leads.js`).
- `hasReviewedCategory()` is unchanged — still keys off
  `Category:Reviewed`, unrelated to this change.
- Badge trigger logic is otherwise identical to today: ≥1 Evidence entry
  → gold "Sources cited" badge; `Category:Reviewed` → green "Reviewer
  confirmed" badge, independently of each other.

## CSS (`bhf-evidence` BEM root)

Reuses the existing brand palette and typography — no new colors:

- `.bhf-evidence-panel` — the `<details>` container: parchment surface,
  gold-bordered shell, matching the existing infobox/pull-quote treatment.
- `.bhf-evidence-panel__summary` — the `<summary>` toggle, Neue Kabel,
  with the browser's native disclosure-triangle marker.
- `.bhf-evidence-panel__category` — each top-level category heading (e.g.
  "Government Records (2)"), Neue Kabel, terracotta/firebrick accent
  underline.
- `.bhf-evidence-panel__subcategory` — Primary Documents' five children,
  visually indented under the parent heading.
- `.bhf-evidence-entry` — each source's card: bold title, a metadata line
  (type · date · repository, same treatment as the old
  `.bhf-citation__meta`), a Reliability tag reusing the exact
  verified=green / single-source=default / disputed=red logic and colors
  already established, and the citation text in a smaller, muted style
  below.

## Testing Plan

- `tests/evidence-panel.test.js` (new): `groupEvidenceByCategory()` —
  correctly buckets all 12 types, keeps Primary Documents' direct entries
  separate from its five children, omits empty categories/subcategories,
  produces the fixed display order regardless of input order.
  `renderEvidencePanel()` — valid `<details>` markup, HTML-escapes every
  field (title, repository, citation, etc.) to prevent injection, same
  discipline as `research-leads.js`'s `escapeHtml` tests.
  `countEvidenceEntries()` — correct total across all categories.
- `tests/citizen-theme.test.js` additions: every new `.bhf-evidence-*`
  class is defined; Reliability tag colors match the existing
  verified/single-source/disputed hex values exactly (no new colors
  introduced).
- `tests/citation-badges.test.js` updates: existing tests re-pointed at
  `.bhf-evidence-entry` instead of `.bhf-citation`; badge trigger logic
  assertions unchanged otherwise.
- Manual smoke-test checklist additions: a page with sources in multiple
  categories (including Primary Documents both directly and via a child
  category) shows the correctly grouped, correctly ordered panel; a page
  with zero Evidence entries shows no panel; with JS disabled, entries
  remain visible inline and ungrouped; with JS enabled, each source
  appears exactly once (in the panel, not also inline).

## Migration

`{{Citation}}` is retired. This repo's existing sample content — the
`Robert "Black Bob" Renfro` and `Fort Nashborough` articles' `{{Citation}}`
usages — is converted to `{{Evidence}}` as part of implementation. This is
a one-time manual wikitext conversion of a small, known set of existing
usages, not a live-wiki data migration (there is no deployed content with
real reader traffic yet to migrate).

## Open Items for Future Phases (explicitly out of scope here)

- AI-assisted source suggestion, extraction, or auto-classification.
- Actual digital-scan upload/viewing UI (the `scanUrl` field is reserved
  but inert).
- Any per-category independent collapse/expand (all categories are
  visible together once the outer panel opens).
