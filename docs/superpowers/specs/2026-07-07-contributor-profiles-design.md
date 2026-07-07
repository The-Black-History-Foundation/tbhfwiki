# Contributor Profiles — Design

**Date:** 2026-07-07
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

The base theme's discovery rail already surfaces contributor usernames on
"Recently Added" cards, and the citation tooling project made source quality
visible per-article — but there's no way to see who's researching what, or how
much a given contributor has added to the archive. This project makes
contributors themselves discoverable: a styled bio/research-interests profile
on their existing MediaWiki user page, plus automatically-computed contribution
stats, following the same "on-wiki CSS/JS/wikitext, no new backend" pattern as
the base theme and the citation tooling.

## Scope

- `Template:ContributorProfile` — a wikitext template for a contributor's own
  `User:` page: free-text bio, research-interest tags, an optional featured
  article link.
- `src/contributor-stats.js` + bootstrap — pure functions and a browser
  bootstrap that compute and display three stats on a `User:` page: distinct
  articles contributed, a citation-count proxy, and last-active date — all
  derived from MediaWiki's own API, never manually entered.
- A small change to the existing `renderCard` function (from the base theme's
  discovery rail) linking each card's contributor name to their `User:` page.
- Out of scope: any new namespace, any new extension, exact per-citation
  attribution (see the Citation Stat Proxy section below for why), follower/
  social features, private messaging, or any account-management change.

## Scope Decision

Three levels of ambition were considered for what to add on top of MediaWiki's
native `User:` page: bio template only (simplest, but drops the "who's
researching what" discoverability goal); auto-stats only (no editorial
content); and the combination — **chosen**. Contributors write their own bio/
interests by hand (an editorial choice, like the citation project's confidence
ratings); the numbers are always computed, never manually entered, so they
can't go stale or be gamed.

## `Template:ContributorProfile`

**Fields:**

| Field | Required | Description |
|---|---|---|
| `bio` | Yes | Free-text biography |
| `interest1` … `interest5` | No | Up to 5 individual research-interest tags, e.g. `interest1=Nashville`, `interest2=Oral History` |
| `featured` | No | A wikilink to one article the contributor wants to highlight |

Interest tags are five discrete numbered parameters, not one pipe-separated
string. Splitting a delimited string into repeated markup in wikitext needs the
Arrays extension (`{{#arraymap:}}`) — a real new extension dependency this
project's "no new extension" constraint rules out (found while writing the
implementation plan; ParserFunctions' `{{#if:}}`/`{{#switch:}}`, already relied
on by the base theme and citation tooling, cannot split a string on its own).
Five discrete slots achieve the same user-facing outcome — a handful of
freeform tags — with only ParserFunctions.

**Usage** (added to the contributor's own `User:` page):

```wikitext
{{ContributorProfile
|bio=I research free Black communities in 18th-century Nashville, focusing on land records and oral histories passed through my family.
|interest1=Nashville
|interest2=Oral History
|interest3=18th century
|featured=Robert Renfro
}}
```

**Rendering:** a profile card at the top of the page — bio text, interest tags
below it (reusing the same small-pill tag visual language as the citation
tooling's confidence tags), an empty stats mount point
(`<div id="bhf-contributor-stats"></div>`, same mount-point pattern as the
citation badges), and — if `featured` is set — a small card linking to that
article, visually similar to the homepage's featured-hero treatment but scaled
down for a sidebar/profile context.

## Contribution Stats

Three stats, computed automatically, never manually entered:

- **Distinct articles contributed** — number of unique pages the user has
  edited, from MediaWiki's core `list=usercontribs` API.
- **Last active** — the timestamp of their most recent contribution, from the
  same API call.
- **Citations on your articles** (a proxy, not exact per-citation attribution
  — see below) — counts `{{Citation` usages across the pages they've edited.

### Citation Stat Proxy — and its honest limitation

Precisely attributing "citations *this specific user* added" would require
diffing every edit's wikitext to detect newly-inserted `{{Citation}}` calls —
heavier, slower JS (one diff fetch per edit) and more fragile (parsing diff
HTML) than this project's established pattern supports. Instead, this stat
counts citations present on pages the user has edited at all — a looser proxy
that can over-credit a contributor who copyedited a heavily-sourced article
someone else wrote the citations for. This tradeoff is accepted deliberately
(see Scope Decision) and must be labeled honestly in the UI — e.g. "**M**
citations across your 50 most recently edited articles" — rather than implying
personal authorship of every counted citation.

**Bounded to 50 pages.** To avoid unbounded API calls for a prolific
contributor, the citation proxy only scans the 50 most-recently-edited distinct
pages (per the `list=usercontribs` results), not full history. This cap is
disclosed in the rendered stat text itself, not silently applied.

## Rendering & Computation Flow

Mirrors the pure-function/bootstrap split already established by
`discovery-rail.js`/`.bootstrap.js` and `citation-badges.js`/`.bootstrap.js`:

- **Pure functions** in `src/contributor-stats.js` (unit-tested, no `mw`/
  `document`/`fetch`):
  - `countDistinctArticles(contributions)` → number — takes a plain array of
    `{ title, timestamp }` objects (the bootstrap extracts this array from the
    raw `list=usercontribs` API response before calling it — the function
    itself never touches the response envelope) and returns the count of
    distinct `title` values.
  - `lastActiveDate(contributions)` → string | null — takes the same plain
    array shape as `countDistinctArticles`, returns the most recent
    `timestamp` value, or `null` if the array is empty. MediaWiki's
    `usercontribs` API returns contributions newest-first by default, but this
    function does not assume that ordering — it finds the maximum timestamp
    explicitly, so it stays correct even if the bootstrap's request parameters
    ever change.
  - `countCitationTemplateUsages(wikitext)` → number — counts `{{Citation`
    occurrences in a single page's raw wikitext string.
  - `sumCitationCounts(perPageCounts)` → number — sums an array of per-page
    counts. Kept separate from the fetch-and-cap-at-50 looping logic, which
    lives in the bootstrap, not in a pure function.
- **Bootstrap** (`src/contributor-stats.bootstrap.js`, browser-only, runs when
  `#bhf-contributor-stats` is present on the page):
  1. Extracts the username from the page title (`User:Username` → `Username`).
  2. Calls `list=usercontribs` for that username to get distinct edited
     articles and the last-active timestamp.
  3. For up to the 50 most recent distinct pages from that list, calls
     `prop=revisions&rvprop=content` to fetch each page's wikitext and counts
     citation usages, then sums them.
  4. Renders the three stats as text into the mount point.
- **No-JS / new-contributor fallback:** if `usercontribs` returns zero edits,
  or before JS has run, the stats slot renders nothing rather than a
  misleading "0 articles" — the same honest-empty-state pattern the citation
  badges already use.

## Discovery Rail Change

`renderCard` (in `src/discovery-rail.js`, from the base theme) wraps the
contributor's username in a link to `/wiki/User:<username>`, reusing the
existing URL-escaping approach already used for article links in the same
function. This is a small, targeted change to an already-tested function, not
a new component — one new test case covers it.

## Testing / Validation Plan

- Unit tests (`node --test`) for `countDistinctArticles`, `lastActiveDate`,
  `countCitationTemplateUsages`, and `sumCitationCounts` against constructed
  fixture data (plain arrays/objects simulating API responses — no real
  `mw`/`document`, consistent with this project's zero-npm-dependency,
  DOM-free pure-function constraint).
- A new test on `discovery-rail.js`'s existing `renderCard` tests confirming
  the contributor name is now wrapped in a `User:` page link.
- CSS tests (`node --test` against `citizen-theme.css`) for the profile card
  shell, interest tags, and featured-article mini-card.
- Manual smoke test (extending the existing checklist): a `User:` page with
  `{{ContributorProfile}}` shows bio/tags/featured card; stats populate
  automatically for a user with edit history; a brand-new user with zero edits
  shows no stats block (not a broken "0" state); a "Recently Added" card's
  contributor name links to their `User:` page.

## Open Items for Future Phases (explicitly out of scope here)

- Exact per-citation attribution (deferred — see Citation Stat Proxy above).
- Follower/social features, contributor leaderboards, or gamified badges tied
  to contribution stats.
- Raising or making configurable the 50-page citation-proxy cap.
