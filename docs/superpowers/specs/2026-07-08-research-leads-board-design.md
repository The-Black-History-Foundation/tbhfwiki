# Research Leads Board — Design

**Date:** 2026-07-08
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

Community-held history is often true long before it's provable — the Clotilda
was documented in Africatown's oral tradition for over a century before
archaeology confirmed it in 2019, having been dismissed by outside
researchers the whole time. This wiki needs a place to hold accounts like
that: stories the community believes, that need a *specific, nameable kind of
help* to move forward (archival access, translation, fieldwork, funding,
expertise, or digitization) — and a way for a reader to see what's needed and
respond to it, distinct from just editing an article.

## Scope

- `Template:ResearchLead` — a wikitext template for a lead's own page:
  summary of the community account, what's already known/corroborated,
  need-triggers, and a status.
- A category-based organization scheme (no new namespace, no new extension)
  that auto-tags leads by need-type and status from the template's own
  parameters.
- `src/research-leads.js` + bootstrap — a browsable Leads Board grouping open
  leads by what they need, following the exact pure-function/bootstrap
  pattern already used by the discovery rail, citation tooling, and
  contributor profiles in this project.
- A forward-compatible (but unbuilt) hook for a future "Charity Coin"
  perpetual-raffle fundraising app: an optional `campaignUrl` field on
  funding-tagged leads.
- Out of scope: any actual fundraising/payment mechanism, any new comment
  system (leads use MediaWiki's existing Talk pages), any volunteer
  sign-up/tracking backend, and building or integrating with Charity Coin
  itself — that app does not exist yet and is not part of this project.

## Scope Decision

Three levels of "how to help" were considered: routing to existing channels
only (Talk pages, the site's existing donate link); a lightweight
mailto-style contact link; and a real volunteer/funding-tracking backend. The
user clarified a fourth, more specific answer during brainstorming: a
separate app called **Charity Coin** (a perpetual raffle sweepstake) is
planned for fundraising and may link to specific leads in the future — but
does not exist yet. This project's job is to make the "need" itself visible
and structured (so a future integration has something to point at), not to
build the fundraising mechanism. Discussion reuses MediaWiki's native Talk
pages rather than a new comment system, per explicit decision.

For lead organization, two approaches were considered: a dedicated `Lead:`
MediaWiki namespace (requires registering `$wgExtraNamespaces` in
`LocalSettings.php` — a heavier, more structural config change than anything
else in this project) versus category-based plain articles (zero config
changes, matching the pattern this project already uses for
`Category:Reviewed`). **Category-based was chosen** to keep deployment as
lightweight as every other feature built so far.

## `Template:ResearchLead`

**Fields:**

| Field | Required | Description |
|---|---|---|
| `summary` | Yes | The community account / what's believed to be true |
| `known` | No | What's already documented or corroborated so far |
| `needed1` … `needed3` | No | Up to 3 need-triggers: `archival`, `translation`, `fieldwork`, `funding`, `expertise`, `digitization` |
| `status` | Yes | One of `open`, `in-progress`, `resolved` |
| `campaignUrl` | No | A future Charity Coin campaign link — only meaningful when one of `needed1`-`needed3` is `funding`. Left empty until that app exists; this project does not build or require it. |

Interest/need tags are discrete numbered parameters (`needed1`..`needed3`),
not a pipe-separated string — the same design already established for
`Template:ContributorProfile`'s `interest1`..`interest5`, to avoid a
dependency on the Arrays extension (`{{#arraymap:}}`), which this project's
"no new extension" constraint rules out.

**Usage:**

```wikitext
{{ResearchLead
|summary=Community oral histories describe a burial ground beneath the Union Street lot, consistent with church records referencing an 1850s congregation on the site.
|known=Two family accounts independently describe the same location; no archival or archaeological confirmation yet.
|needed1=archival
|needed2=fieldwork
|status=open
}}
```

**Rendering:** a card at the top of the lead's page — the summary, "what's
known so far," a row of need-trigger tags (reusing the small-pill visual
language already established by citation confidence tags and profile
interest tags), a status badge, and a "Discuss this lead" link pointing at
the page's own Talk page (MediaWiki gives every page one automatically — no
new comment system is built).

**Auto-categorization:** the template computes, from its own parameters
(via `{{#switch:}}`, not manually added by the editor):
- `[[Category:Research Leads]]` — always, on every lead page.
- One category per populated `neededN` value, e.g.
  `[[Category:Needs Archival Access]]`, `[[Category:Needs Funding]]`.
- One category per `status` value, e.g. `[[Category:Lead Status Open]]`.

These categories are invisible in the rendered card (standard MediaWiki
category-link suppression, matching how `Category:Reviewed` is used
elsewhere in this project) — they exist purely so the Leads Board can query
membership via the API, not as reader-facing navigation.

## Leads Board

- A dedicated page (linked from site navigation) listing **open** leads,
  grouped by need-trigger: Needs Archival Access, Needs Translation, Needs
  Fieldwork, Needs Funding, Needs Expertise, Needs Digitization. A lead with
  multiple `neededN` values appears in each relevant group.
- **Resolved leads are excluded by default** — the board shows what's
  currently open, not a full archive of every lead ever posted. (Resolved
  leads remain visible and browsable via `Category:Research Leads` and
  `Category:Lead Status Resolved` directly, just not on the board itself.)
- **Computation**, mirroring the discovery rail's architecture exactly:
  - `src/research-leads.js` (pure functions, unit-tested, no `mw`/`document`/
    `fetch`):
    - `groupLeadsByNeed(openTitles, needMemberships)` → an object keyed by
      each of the 6 need-trigger names, each value an array of lead page
      titles. `openTitles` is a plain array of page-title strings (the
      bootstrap extracts this from `Category:Lead Status Open`'s
      `categorymembers` response before calling in). `needMemberships` is a
      plain object with one key per need-trigger
      (`archival`/`translation`/`fieldwork`/`funding`/`expertise`/
      `digitization`), each value an array of page-title strings (the
      bootstrap extracts one such array per need-category API call). The
      function itself never touches `document`/`mw`/`fetch` or a raw API
      response envelope — filters each need-category's member list down to
      titles that also appear in `openTitles`, so resolved/in-progress leads
      are excluded from the board regardless of which need-categories they
      belong to.
    - `renderLeadCard(lead)` → HTML string, reusing the discovery rail's
      `escapeHtml`-everywhere discipline.
  - `src/research-leads.bootstrap.js` (browser-only): calls
    `list=categorymembers` once for `Category:Lead Status Open` and once per
    need-category (7 calls total), extracts each response's plain title
    array, passes them into `groupLeadsByNeed`, and renders the grouped
    result into a mount point on the Leads Board page.
- Each card shows the lead's title and a short excerpt of its `summary`,
  linking to the full lead page (where the complete account, status, and
  "Discuss this lead" link live).

## Testing / Validation Plan

- Unit tests (`node --test`) for `groupLeadsByNeed` and `renderLeadCard`
  against constructed fixture data (plain objects/arrays simulating
  category-membership API results — no real `mw`/`document`).
- CSS tests (`node --test` against `citizen-theme.css`) for the lead card
  shell, need-trigger tags, and status badge — reusing established tokens,
  no new colors, same discipline as every prior feature.
- Manual smoke test (extending the existing checklist): a lead page with
  `status=open` and two `neededN` values appears in both corresponding board
  groups; a `status=resolved` lead does not appear on the board at all but
  is still reachable via its category page; "Discuss this lead" links to a
  real, working Talk page.

## Open Items for Future Phases (explicitly out of scope here)

- Building or integrating with Charity Coin itself (the `campaignUrl` field
  is a placeholder hook only).
- Any volunteer sign-up or contribution-tracking system.
- A dedicated `Lead:` namespace (deferred — see Scope Decision).
- Notifications or alerts when a lead's status changes.
