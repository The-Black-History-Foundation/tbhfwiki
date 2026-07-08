# TBHF Wiki Skin — Citizen theme

Theming for [The Black History Foundation](https://www.tbhfdn.org)'s community
wiki — a place for discovering and sharing Black history research. Built
entirely as on-wiki customization of the stock [Citizen](https://www.mediawiki.org/wiki/Skin:Citizen)
MediaWiki skin: CSS custom-property overrides, small JS modules, and wikitext
templates. **No forked skin package, no core MediaWiki changes.**

## Features

- **Base theme** — a warm parchment background with the TBHF brand's
  Firebrick Red / Gold / Dark Green accents and Helvetica/Neue Kabel
  typography, a homepage with a "discovery rail" (Recently Added +
  Trending articles), and article components (infoboxes, pull-quotes,
  breadcrumbs, contribute prompts).
- **Source-citation tooling** — a `{{Citation}}` template with source types
  and confidence ratings, plus automatic "Sources cited" and "Reviewer
  confirmed" badges computed from real page content (never a manual flag).
- **Contributor profiles** — a bio/research-interests card on a contributor's
  own `User:` page, with automatically-computed stats (articles edited,
  citations added, last active).
- **Research leads board** — a `{{ResearchLead}}` template for community
  accounts that need help to advance (archival access, translation,
  fieldwork, funding, expertise, digitization), and a browsable board
  grouping open leads by what they need.

Every feature follows the same pattern: pure, unit-tested JS functions in one
file, paired with a thin browser-only `mw.Api()` bootstrap in a
`*.bootstrap.js` file, plus CSS in the shared stylesheet and wikitext
templates. See `docs/superpowers/specs/` for the full design of each feature
and `docs/superpowers/plans/` for how each was built.

## Deploying

1. Install MediaWiki + the Citizen skin (unmodified) per
   https://www.mediawiki.org/wiki/Skin:Citizen#Installation.
2. Paste the entire contents of `src/citizen-theme.css` into
   `MediaWiki:Citizen.css` on the wiki.
3. Paste the following JS files into `MediaWiki:Citizen.js`, **each pure
   module immediately followed by its own bootstrap** (order between
   different features doesn't matter, but within a feature the pure module
   must come before its bootstrap):
   - `src/discovery-rail.js` then `src/discovery-rail.bootstrap.js`
   - `src/citation-badges.js` then `src/citation-badges.bootstrap.js`
   - `src/contributor-stats.js` then `src/contributor-stats.bootstrap.js`
   - `src/research-leads.js` then `src/research-leads.bootstrap.js`
4. Paste `src/Citizen-preferences.json` into
   `MediaWiki:Citizen-preferences.json` (forces the light theme, matching
   this project's design).
5. Add the snippet in `LocalSettings-snippet.php` to your `LocalSettings.php`.
6. Create each file in `src/templates/` as an on-wiki page (see the table
   below for what to name each one).
7. Create a page (e.g. "Research Leads") with the contents of
   `src/templates/LeadsBoard.wikitext` and link it from site navigation.
8. Paste `src/Sidebar.wikitext`, `src/Explore-the-archive.wikitext`, and
   `src/About-and-contribute.wikitext` (also listed in the table below,
   but — like `src/Citizen-preferences.json` above — these three live at
   the top level of `src/`, not under `src/templates/`) into
   `MediaWiki:Sidebar`, `MediaWiki:Explore-the-archive`, and
   `MediaWiki:About-and-contribute` respectively.

### Templates

| File | Create as |
|---|---|
| `MainPage.wikitext` | The wiki's `Main Page` |
| `Infobox.wikitext` | `Template:Infobox` |
| `ArticleBreadcrumb.wikitext` | `Template:ArticleBreadcrumb` |
| `RelatedPages.wikitext` | `Template:RelatedPages` |
| `Quote.wikitext` | `Template:Quote` |
| `ContributeFooter.wikitext` | `Template:ContributeFooter` |
| `Citation.wikitext` | `Template:Citation` |
| `ContributorProfile.wikitext` | `Template:ContributorProfile` |
| `ResearchLead.wikitext` | `Template:ResearchLead` |
| `LeadsBoard.wikitext` | Any page you link from navigation (e.g. "Research Leads") |
| `AboutProject.wikitext` | A page titled `About This Wiki` |
| `TermsOfUse.wikitext` | A page titled `Terms of Use` |
| `Sidebar.wikitext` | `MediaWiki:Sidebar` |
| `Explore-the-archive.wikitext` | `MediaWiki:Explore-the-archive` |
| `About-and-contribute.wikitext` | `MediaWiki:About-and-contribute` |

### Optional extensions

Two features degrade gracefully if these aren't installed — nothing breaks,
some content just doesn't appear:

- **PageViewInfo** — powers the homepage's "Trending" column. Without it,
  that column hides itself automatically.
- **TextExtracts** — lets the research leads board show a short excerpt per
  lead. Without it, the board falls back to titles-only cards.

## Running tests

No `package.json`, no npm install — uses Node's built-in test runner (Node
24+):

```
node --test tests/citizen-theme.test.js tests/discovery-rail.test.js tests/config.test.js tests/citation-badges.test.js tests/contributor-stats.test.js tests/research-leads.test.js
```

(Passing just `tests/` as a directory doesn't work reliably on Windows — list
the files explicitly, as above.)

## Verifying on a live wiki

This project was built without a live MediaWiki instance available (no
Docker in the build environment), so none of it has been visually verified
in a browser yet. `docker-compose.yml` brings up a local MediaWiki + Citizen
stack for exactly that purpose — see
`docs/superpowers/plans/2026-07-06-smoke-test-checklist.md` for the full
manual verification checklist to run through once it's up.
