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

- Theming (front-end only) for the stock Citizen MediaWiki skin, applied via
  `MediaWiki:Citizen.css`, `MediaWiki:Citizen.js`, wikitext templates, and a small
  `LocalSettings.php` config snippet — no forked skin package.
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

**Unmodified [Citizen](https://www.mediawiki.org/wiki/Skin:Citizen) skin, themed entirely
through MediaWiki's on-wiki customization pages — no fork.**

Rationale: Citizen is an actively-maintained, responsive MediaWiki skin that already
implements the closest existing analog to Fandom's UX — sticky navigation, card-based
layouts, and a recent-activity rail. Its maintainers expose a first-class theming path
built for exactly this purpose: CSS custom properties overridden in `MediaWiki:Citizen.css`,
behavior added via `MediaWiki:Citizen.js` (or a Gadget), and a few `LocalSettings.php`
config values (logo, default theme). Everything in this spec — palette, typography,
homepage layout, discovery rail, infobox styling, pull-quote and badge components — is
achievable through this path, since none of it requires rearranging Citizen's header/
footer DOM structure. This was chosen over (a) forking Citizen into a custom skin
package (more files to build and keep in sync with upstream, for no functional gain
here), (b) reskinning Vector 2022 (safer core compatibility, but fights Vector's
encyclopedia-style layout to get a discovery/community feel), and (c) a from-scratch
SkinMustache build (maximum distinctiveness, but far higher build and maintenance cost).

**What this project touches:**
- `MediaWiki:Citizen.css` — palette (CSS custom properties), typography (font-family
  variables), paper-grain texture, homepage hero/rail/category-tile styling, infobox
  shell, pull-quote, "sources verified" badge, contribute-prompt footer
- `MediaWiki:Citizen.js` (or a Gadget) — discovery rail data fetching (Recently Added
  via core API, Trending via PageViewInfo API if present)
- `LocalSettings.php` — logo config (`$wgLogos`), default theme if applicable
- Wikitext templates (e.g. `Template:Infobox`, `Template:FeaturedArticle`,
  `Template:Quote`) that apply the CSS classes defined above — ordinary wiki content,
  not code, but part of this project's deliverable so the styling has something to
  attach to
- New CSS components: category browse tiles, oral-history pull-quote, "sources
  verified" badge, contribute-prompt footer

**What this project does not touch:**
- Citizen's PHP, Mustache templates, or JS internals (sticky nav, collapsible TOC,
  search-as-you-type) — Citizen is installed and upgraded unmodified
- Core MediaWiki functionality (editing, categories, talk pages, permissions)
- Any PHP extension logic

**Dependency:** The homepage "Trending / Most Viewed" module requires a page-view-
tracking extension (e.g. PageViewInfo) to be installed on the wiki. Our JS styles and
populates this module from that extension's API, but does not generate view-count data
itself. "Recently Added" needs no extra extension (built on the core
`list=recentchanges` API).

**Deliverable:** A small set of on-wiki pages (`MediaWiki:Citizen.css`,
`MediaWiki:Citizen.js`, wikitext templates) plus a short `LocalSettings.php` snippet —
portable to any MediaWiki install running the stock Citizen skin, with no custom skin
package to maintain. Version-controlled as plain files in this repo and applied to the
wiki via copy-paste or a small import script (Task 1 of the implementation plan covers
which).

## Visual Design System — "Heritage Archival"

### Color palette

| Role | Description | Hex (approx) | Citizen CSS variable |
|---|---|---|---|
| Background (page) | Aged parchment cream | `#F4EDE1` | `--color-surface-0` |
| Surface (cards/panels) | Warm ivory | `#FBF7EF` | `--color-surface-1` |
| Raised elements | Slightly deeper ivory | `#F3ECDD` | `--color-surface-2` |
| Primary text | Deep espresso brown | `#2A1D14` | `--color-base`, `--color-emphasized` |
| Primary brand / links | Deep brown | `#5C3A21` | `--color-link` (via `--color-progressive-oklch__h/c/l`) |
| Accent (CTAs, highlights, badges) | Antique gold/brass | `#B8863B` | custom property, not a direct Citizen token — introduced as `--bhf-color-accent-gold` and referenced from our own component CSS |
| Secondary accent (dividers, hover) | Muted terracotta | `#A8482F` | custom property `--bhf-color-accent-terracotta` |
| Borders / hairlines | Soft brown-grey | `#D9CBB4` | `--border-color-base` |
| Success / verified marker | Deep forest green | `#3B5C40` | `--color-success` |

Citizen's primary/link color is driven by OKLCH (`--color-progressive-oklch__h/c/l`),
not a raw hex — the deep brown above will be converted to its OKLCH equivalent during
implementation. The gold and terracotta accents aren't part of Citizen's token set, so
they're introduced as new custom properties on `:root` in `MediaWiki:Citizen.css` and
consumed directly by our own component CSS (badges, pull-quotes, category tiles).

All accent-on-parchment pairings must be checked for WCAG AA contrast during
implementation (not just primary body text). Contrast ratios were computed during
planning: gold-on-parchment text is only 2.77:1 (fails AA) — gold must be used as a
**filled background** (badge/chip/button, with espresso text on top, 5.07:1 — passes)
or for large headings/icons/borders, never as small text color directly on parchment
or ivory. Deep brown, terracotta, and forest green all pass AA as text color on
parchment (8.67:1, 4.97:1, 6.47:1 respectively).

### Typography

- **Headings:** A serif with gravitas (e.g. Source Serif 4 or Lora) — article titles,
  section headers, homepage masthead. Set via Citizen's `--font-family-citizen-serif`.
- **Body:** A clean, highly-readable humanist sans (e.g. Source Sans 3 or Inter) —
  article prose, nav, UI chrome. Set via `--font-family-citizen-base`.
- **Accent/label text:** Small caps or a slightly condensed sans — category tags,
  "verified source" badges, timeline era labels — visually distinct from prose,
  implemented as a utility class in our own CSS rather than a Citizen variable.
- A metric-matched fallback font must be generated for the chosen body font to avoid
  layout shift on load (Citizen's documented "font flicker" guidance).

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
- **Theme:** Light "parchment" theme only — no dark mode in this phase. Since Citizen
  ships Light/Dark/Pure-Black/Automatic by default, this requires explicitly overriding
  `MediaWiki:Citizen-preferences.json` to remove the theme picker and forcing the light
  theme via `$wgCitizenThemeDefault` in `LocalSettings.php`, rather than merely omitting
  dark-mode styles.

## Testing / Validation Plan

- Visual QA against the palette/type system on: homepage, a Person article, a Place
  article, an Event article, mobile widths, and desktop widths.
- WCAG AA contrast check on all accent-on-parchment color pairings.
- Confirm `MediaWiki:Citizen.css`/`MediaWiki:Citizen.js` apply cleanly on a clean
  MediaWiki + stock Citizen install, with and without PageViewInfo installed (Trending
  module should degrade gracefully — e.g. hide the Trending column — if the extension
  is absent).
- Confirm performance-mode users (Citizen's "reduce motion/effects" preference) get a
  lighter version of the paper-grain texture and any transitions we add, per Citizen's
  performance-mode guidance.

## Open Items for Future Phases (explicitly out of scope here)

- Contributor profiles, source-citation tooling, submission/review workflows (deferred
  per the "skin/theme only" scope decision).
- Dark mode (deferred per platform-preferences decision).
