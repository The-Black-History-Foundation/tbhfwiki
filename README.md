# TBHF Wiki Skin — Citizen theme

Theming for [The Black History Foundation](https://www.tbhfdn.org)'s community
wiki — a place for discovering and sharing Black history research. Built
entirely as on-wiki customization of the stock [Citizen](https://www.mediawiki.org/wiki/Skin:Citizen)
MediaWiki skin: CSS custom-property overrides, small JS modules, and wikitext
templates. **No forked skin package, no core MediaWiki changes.**

## Features

- **TBHF brand theme** — colors and typography aligned with [tbhfdn.org](https://tbhfdn.org)
  (Ocean Blue / Gold / Sea Green on clean white backgrounds), a homepage with a
  "discovery rail" (Recently Added + Trending articles), and article components
  (infoboxes, pull-quotes, breadcrumbs, contribute prompts).
- **Evidence Explorer** — a `{{Evidence}}` template organizing sources into
  a 12-category taxonomy (Primary Documents and its five sub-types, plus
  Newspapers, Books, Academic Papers, Oral Histories, DNA Studies, and
  Archaeology), rendered as a collapsible per-article panel, plus automatic
  "Sources cited" and "Reviewer confirmed" badges computed from real page
  content (never a manual flag).
- **Contributor profiles** — a bio/research-interests card on a contributor's
  own `User:` page, with automatically-computed stats (articles edited,
  evidence entries added, last active).
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

See **[DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md)** for Railway hosting (account: `tech@tbhfdn.org`).

Automated theme upload:

```bash
export MW_API_URL=https://<your-service>.up.railway.app/w/api.php
export MW_BOT_USER=tech@tbhfdn.org
export MW_BOT_PASSWORD=<password>
node scripts/deploy-theme.mjs
```

Manual deploy (if not using `scripts/deploy-theme.mjs`):

1. Install MediaWiki + the Citizen skin (unmodified) per
   https://www.mediawiki.org/wiki/Skin:Citizen#Installation.
2. Upload font and logo assets from `assets/` (see `assets/README.md`).
3. Paste the entire contents of `src/citizen-theme.css` into
   `MediaWiki:Citizen.css` on the wiki.
4. Paste the following JS files into `MediaWiki:Citizen.js`, **each pure
   module immediately followed by its own bootstrap** (order between
   different features doesn't matter, but within a feature the pure module
   must come before its bootstrap):
   - `src/discovery-rail.js` then `src/discovery-rail.bootstrap.js`
   - `src/evidence-panel.js` then `src/evidence-panel.bootstrap.js`
   - `src/citation-badges.js` then `src/citation-badges.bootstrap.js`
   - `src/contributor-stats.js` then `src/contributor-stats.bootstrap.js`
   - `src/research-leads.js` then `src/research-leads.bootstrap.js`
5. Paste `src/Citizen-preferences.json` into
   `MediaWiki:Citizen-preferences.json` (forces the light theme, matching
   this project's design).
6. Add the snippet in `LocalSettings-snippet.php` to your `LocalSettings.php`.
7. Create each file in `src/templates/` as an on-wiki page (see the table
   below for what to name each one).
8. Create a page (e.g. "Research Leads") with the contents of
   `src/templates/LeadsBoard.wikitext` and link it from site navigation.
9. Paste `src/Sidebar.wikitext`, `src/Explore-the-archive.wikitext`, and
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
| `Evidence.wikitext` | `Template:Evidence` |
| `ContributorProfile.wikitext` | `Template:ContributorProfile` |
| `ResearchLead.wikitext` | `Template:ResearchLead` |
| `LeadsBoard.wikitext` | Any page you link from navigation (e.g. "Research Leads") |
| `AboutProject.wikitext` | A page titled `About This Wiki` |
| `TermsOfUse.wikitext` | A page titled `Terms of Use` |
| `HelpContributing.wikitext` | `Help:Contributing` |
| `Sidebar.wikitext` | `MediaWiki:Sidebar` |
| `Explore-the-archive.wikitext` | `MediaWiki:Explore-the-archive` |
| `About-and-contribute.wikitext` | `MediaWiki:About-and-contribute` |

### Required extension

- **InputBox** — powers the homepage's hero search box
  (`src/templates/MainPage.wikitext` uses the `<inputbox>` tag). MediaWiki's
  Sanitizer does not allow raw `<form>`/`<input>`/`<button>` tags in
  wikitext content — it HTML-escapes them into visible, non-functional text
  instead of rendering a working form. InputBox is bundled with core
  MediaWiki downloads (nothing extra to download); `LocalSettings-snippet.php`
  enables it with `wfLoadExtension('InputBox')`. Without this, the search
  box on the homepage will not work.

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
node --test tests/citizen-theme.test.js tests/discovery-rail.test.js tests/config.test.js tests/citation-badges.test.js tests/contributor-stats.test.js tests/research-leads.test.js tests/evidence-panel.test.js
```

(Passing just `tests/` as a directory doesn't work reliably on Windows — list
the files explicitly, as above.)

## Verifying on a live wiki

Every feature through the homepage redesign has been deployed to and
verified against a real running MediaWiki + Citizen instance (MediaWiki
1.43.9, SQLite backend) — not just unit-tested. `docker-compose.yml`
brings up a local MediaWiki + Citizen stack for anyone reproducing this
(on MariaDB, not SQLite — either backend works, this repo's own
verification just happened to use SQLite); see
`docs/superpowers/plans/2026-07-06-smoke-test-checklist.md` for the full
manual verification checklist. New features (like this one) should still be
walked through that checklist before being considered done.
