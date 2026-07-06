# Black History Community Wiki — MediaWiki Skin Design

**Date:** 2026-07-06
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

The Black History Foundation wants a MediaWiki-based community wiki for discovering and
sharing Black history research — biographies, places, and events — contributed by the
community. The goal is a distinctive visual identity in the spirit of Fandom's wiki
skins (rich, browsable, community-first) but tailored to historical research and rooted
in tbhfdn.org's "Protect, Preserve, Empower" brand, rather than a generic MediaWiki look.

This spec covers the **skin/theme only** — visual design, layout, and page components
built on top of standard MediaWiki. It does not cover new backend extensions, custom
data models, or moderation workflows, beyond noting one optional extension dependency
(PageViewInfo, for the trending module).

## Scope

- A MediaWiki skin (front-end only) installable via `skins/` + `LocalSettings.php`.
- Styling for: homepage, article pages (people/places/events), navigation, search,
  infoboxes, and community-contribution touchpoints.
- Out of scope: new PHP extensions, custom database schemas, submission/review workflow
  logic, authentication changes. (These were explicitly deferred — see "Skin/theme only"
  scope decision below.)

## Scope Decision

The user chose "skin/theme only" over building custom community features (contributor
profiles, source-citation tooling, submission workflows) or a full platform redesign.
Those remain candidates for future, separately-scoped projects once the skin ships.

## Technical Approach

**Base skin: fork and retheme [Citizen](https://www.mediawiki.org/wiki/Skin:Citizen).**

Rationale: Citizen is an actively-maintained, responsive MediaWiki skin that already
implements the closest existing analog to Fandom's UX — sticky navigation, card-based
layouts, and a recent-activity rail — so this project overrides its LESS variables,
typography, and a small set of Mustache templates rather than building layout and
responsive behavior from scratch. This was chosen over (a) reskinning Vector 2022
(safer core compatibility, but fights Vector's encyclopedia-style layout to get a
discovery/community feel) and (b) a from-scratch SkinMustache build (maximum
distinctiveness, but far higher build and maintenance cost).

**What this project touches:**
- `skin.json` + LESS variable overrides (palette, typography, spacing)
- Overridden Mustache templates: header/masthead, homepage rail, footer, article
  header, infobox wrapper
- New CSS components: category browse tiles, oral-history pull-quote, "sources
  verified" badge, contribute-prompt footer

**What this project does not touch:**
- Citizen's existing JS behavior (sticky nav, collapsible TOC, search-as-you-type)
- Core MediaWiki functionality (editing, categories, talk pages, permissions)
- Any PHP extension logic

**Dependency:** The homepage "Trending / Most Viewed" module requires a page-view-
tracking extension (e.g. PageViewInfo) to be installed on the wiki. The skin styles
this module, but does not generate view-count data itself. "Recently Added" needs no
extra extension (built on `Special:RecentChanges`/`Special:NewPages`).

**Deliverable:** A portable skin folder with no custom database dependencies beyond
what Citizen and (optionally) PageViewInfo already require.

## Visual Design System — "Heritage Archival"

### Color palette

| Role | Description | Hex (approx) |
|---|---|---|
| Background (page) | Aged parchment cream | `#F4EDE1` |
| Surface (cards/panels) | Warm ivory | `#FBF7EF` |
| Primary text | Deep espresso brown | `#2A1D14` |
| Primary brand / links | Deep brown | `#5C3A21` |
| Accent (CTAs, highlights, badges) | Antique gold/brass | `#B8863B` |
| Secondary accent (dividers, hover) | Muted terracotta | `#A8482F` |
| Borders / hairlines | Soft brown-grey | `#D9CBB4` |
| Success / verified marker | Deep forest green | `#3B5C40` |

All accent-on-parchment pairings must be checked for WCAG AA contrast during
implementation (not just primary body text).

### Typography

- **Headings:** A serif with gravitas (e.g. Source Serif 4 or Lora) — article titles,
  section headers, homepage masthead.
- **Body:** A clean, highly-readable humanist sans (e.g. Source Sans 3 or Inter) —
  article prose, nav, UI chrome.
- **Accent/label text:** Small caps or a slightly condensed sans — category tags,
  "verified source" badges, timeline era labels — visually distinct from prose.

### Texture

A subtle, low-opacity paper-grain texture behind the main content area, reinforcing
the "archival document" feel without hurting legibility. This is the project's
signature visual differentiator from Fandom and other flat/glossy wiki skins.

## Homepage Layout

Top to bottom:

1. **Masthead** — wordmark, tagline ("Discover. Preserve. Share."), prominent search bar.
2. **Featured hero** — one large featured-article card (image + title + excerpt), driven
   by a `Featured` category so editors can rotate it manually.
3. **Discovery rail** (centerpiece) — two card rows, side-by-side on desktop, stacked
   (swipeable) on mobile:
   - **Recently Added** — styled from `Special:NewPages`/`Special:RecentChanges`;
     thumbnail, title, contributor, timestamp.
   - **Trending / Most Viewed** — styled from `Special:PopularPages` (requires
     PageViewInfo or equivalent).
4. **Browse by category strip** — visual tiles for top-level categories (People, Places,
   Events, Eras), linking into category pages.
5. **Community footer band** — "contribute/share a story" call to action, plus standard
   footer links (About, Contact, Donate), matching tbhfdn.org's footer pattern.

## Article Layout (People / Places / Events)

- **Header:** Serif title; breadcrumb-style category tags beneath it (e.g.
  `Person · 18th Century · Nashville`); a "Sources verified" badge slot (gold/green
  accent) shown when an article has a substantial `<references/>` section.
- **Infobox:** One flexible infobox template, right rail on desktop / top-of-article on
  mobile, styled three ways via a `type=` parameter:
  - **Person:** portrait, birth/death, roles, notable relations.
  - **Place:** header image, region, era active, current status.
  - **Event:** date range, location, key figures involved.
  All three share the same gold-edged card shell on parchment background for visual
  cohesion across content types.
- **Body:** Serif subheadings, sans body text; a distinct pull-quote component
  (indented, gold left-border, italic serif) for oral-history excerpts.
- **Sidebar (below infobox):** "Related pages" and "Part of timeline: [Era name]" links,
  reinforcing era/region browsing from the homepage.
- **Talk/contribute footer:** An inviting "Know more about this? Add to this page"
  prompt above the standard talk-page link.

## Navigation & Responsive Behavior

- **Desktop top nav:** Logo/wordmark (left), primary links — Browse by Era, Browse by
  Region, People/Places/Events, Contribute, About (center) — search + Log in/Contribute
  (right).
- **Mobile nav:** Collapses to a hamburger drawer; search remains persistently visible
  in the header; the discovery rail becomes a horizontally swipeable card row.
- **Sticky sub-header:** A slim sticky bar (title + jump-to-section + Contribute link)
  appears on scroll on article pages, on both mobile and desktop — reusing Citizen's
  existing scroll behavior, restyled.
- **Theme:** Light "parchment" theme only — no dark mode in this phase.

## Testing / Validation Plan

- Visual QA against the palette/type system on: homepage, a Person article, a Place
  article, an Event article, mobile widths, and desktop widths.
- WCAG AA contrast check on all accent-on-parchment color pairings.
- Confirm the skin activates cleanly via `LocalSettings.php` on a clean MediaWiki
  install, with and without PageViewInfo installed (Trending module should degrade
  gracefully — e.g. hide the Trending column — if the extension is absent).

## Open Items for Future Phases (explicitly out of scope here)

- Contributor profiles, source-citation tooling, submission/review workflows (deferred
  per the "skin/theme only" scope decision).
- Dark mode (deferred per platform-preferences decision).
- Exact skin name/branding (placeholder used during build: `BlackHistory`/`Sankofa` —
  to be finalized with the user before release).
