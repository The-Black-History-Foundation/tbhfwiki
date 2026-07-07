# TBHF Wiki Skin — Citizen theme

Theming for The Black History Foundation's community wiki, built on the stock
Citizen MediaWiki skin (no fork). See `docs/superpowers/specs/2026-07-06-black-history-wiki-skin-design.md`
for the design and `docs/superpowers/plans/2026-07-06-black-history-wiki-skin-plan.md`
for the build plan.

## Deploying

1. Install MediaWiki + the Citizen skin (unmodified) per
   https://www.mediawiki.org/wiki/Skin:Citizen#Installation.
2. Paste the contents of `src/citizen-theme.css` into `MediaWiki:Citizen.css` on the wiki.
3. Paste the contents of `src/discovery-rail.bootstrap.js` into `MediaWiki:Citizen.js`.
4. Paste `src/Citizen-preferences.json` into `MediaWiki:Citizen-preferences.json`.
5. Add the snippet in `LocalSettings-snippet.php` to your `LocalSettings.php`.
6. Create the wikitext templates in `src/templates/` as on-wiki `Template:` pages.

## Running tests

`node --test tests/` (no npm install required — uses Node's built-in test runner).
