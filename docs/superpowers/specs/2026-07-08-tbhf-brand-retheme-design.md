# TBHF Brand Re-theme — Design

**Date:** 2026-07-08
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

The wiki's "Heritage Archival" palette (deep brown, antique gold, terracotta,
forest green) was designed by inference from limited public information
about tbhfdn.org, before this project had access to the site's actual
source. Now that the real source (`The-Black-History-Foundation/TBHFDN`) is
available, this project re-themes the wiki's accent colors, typography, and
logo to match the foundation's real, documented brand — while deliberately
keeping the parchment/archival background palette, which suits a research
wiki and stays visually distinct from the marketing site.

## A note on the source repo's own inconsistency

`TBHFDN`'s `app/globals.css` currently contains a different palette (Ocean
Blue / Sunshine Yellow / Sea Green / Coral, labeled in a code comment as
"Updated for cruise theme") than the one documented in the repo's own
`README.md` (Firebrick Red / Gold / Dark Green). The user confirmed
Firebrick Red / Gold / Dark Green — the README's documented design system —
is the correct, intended brand; the live CSS's "cruise theme" values appear
to be a stray, undone reskin. **This spec matches the wiki to the
README-documented palette.** Whether tbhfdn.org's own `globals.css` should
be corrected to match its own README is a separate concern, out of scope for
this project (this repo doesn't touch the TBHFDN codebase).

## Scope

- Replace the wiki's accent-color tokens (brand/link, gold, terracotta,
  success) with the real TBHF brand colors.
- Replace Source Serif 4 / Source Sans 3 with the real brand fonts
  (Helvetica, Neue Kabel), self-hosted via wiki `File:` uploads referenced
  through MediaWiki's stable `Special:Redirect/file/` URL — scoped to only
  the weights/styles the theme's CSS actually uses (5 files: Helvetica
  Regular/Bold/Oblique, Neue Kabel Book/Bold), not the full font families.
- Replace the masthead's text wordmark with the real TBHF logo
  (`TBHF_Logo_Full Color.png`), also via a wiki `File:` upload.
- Out of scope: changing background colors (parchment stays — a deliberate
  choice, see below), touching the TBHFDN repo itself, any change to
  tbhfdn.org's own "cruise theme" CSS discrepancy, uploading the full Neue
  Kabel/Helvetica font families (only the weights actually used).

## Scope Decision

Three background-matching options were considered: full match (switch to
white/off-white like the real site), no match (keep everything), and
accent-only match — **accent-only was chosen**. The parchment/archival
palette is a deliberate design choice for a *research wiki* distinct from
the marketing site's look, while the accent colors, typography, and logo
should be the foundation's real, recognizable brand.

For typography, three options were considered: keep the existing free
Google Fonts (zero hosting complexity); a free look-alike of Neue Kabel
(e.g. Oswald); or the real Helvetica + Neue Kabel files, self-hosted on the
wiki. **The real fonts were chosen**, accepting the added complexity of
uploading and referencing font files via `Special:Redirect/file/`, since
this is the foundation's own already-licensed asset being served from its
own wiki (not third-party redistribution).

## Color Token Mapping

The original theme has four accent roles; the real brand has three named
colors. Terracotta's role (secondary accent: disputed citations,
in-progress leads, the dashed contribute-prompt border) merges into
Firebrick Red — both were already "warm red" accents conceptually, and the
real brand doesn't have a second, distinct red-orange.

| Token | Old value | New value | Contrast (computed) |
|---|---|---|---|
| `--color-progressive-oklch__h/c/l` (brand/link) | Deep brown `#5C3A21` | **Firebrick Red `#B22222`** — oklch `H=26.81`, `C=0.1797`, `L=49.68%` | 5.74:1 on parchment (`#F4EDE1`), 6.25:1 on ivory (`#FBF7EF`) — passes AA |
| `--bhf-color-accent-gold` | Antique gold `#B8863B` | **Gold `#FFD700`** | Espresso (`#2A1D14`) text on gold fill: 11.66:1 — passes AA, stronger than before |
| `--bhf-color-accent-terracotta` | `#A8482F` | **Firebrick Red `#B22222`** (same value as brand/link) | Same as above |
| `--bhf-color-success` | Forest green `#3B5C40` | **Dark Green `#006400`** | 6.39:1 both as fill (parchment text) and as text-on-parchment |
| `--bhf-color-text-on-gold` | Espresso `#2A1D14` | Unchanged (still espresso — still passes, more strongly, against the new brighter gold) | 11.66:1 |

**Gold remains fill-only, never text-on-parchment** — the rule from the
original theme carries forward, more strongly: gold-as-text on parchment is
1.21:1 with the real brand's brighter gold (vs. 2.77:1 with the old antique
gold), an even more severe failure. Every existing usage of gold (category
tiles, badges, infobox borders) is already fill-or-border, never bare text,
so no component needs to change shape — only the hex values change.

**Parchment backgrounds, espresso text, and borders are unchanged** —
`--color-surface-0/1/2`, `--color-base`, `--color-emphasized`,
`--border-color-base` keep their existing values. This is the deliberate
"keep parchment" scope decision.

## Typography

Real brand fonts, self-hosted on the wiki, scoped to the weights the
theme's CSS actually uses:

| Role | Font file | Used for |
|---|---|---|
| Body | `Helvetica.ttf` | General body text (`--font-family-citizen-base`) |
| Body bold | `Helvetica-Bold.ttf` | Bold/semibold text within body content |
| Body italic | `Helvetica-Oblique.ttf` | Pull-quotes, masthead tagline |
| Headings | `NeueKabel-Book.otf` | `--font-family-citizen-serif` (despite the variable name, this becomes the *headings* role — the variable name itself is Citizen's own naming, not renamed by this project) |
| Headings bold | `NeueKabel-Bold.otf` | Infobox titles, hero titles, strong headings |

**Hosting mechanism:** `MediaWiki:Citizen.css` is not processed as
wikitext, so parser functions like `{{filepath:}}` don't work inside it.
The standard, stable technique is MediaWiki's `Special:Redirect/file/`
special page, which always resolves to a file's current URL regardless of
its actual hashed upload path:

```css
@font-face {
	font-family: 'TBHF-Helvetica';
	src: url( '/wiki/Special:Redirect/file/Helvetica.ttf' ) format( 'truetype' );
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}
```

(one such rule per file/weight/style combination in the table above).
`--font-family-citizen-base` and `--font-family-citizen-serif` then
reference `'TBHF-Helvetica'` / `'TBHF-NeueKabel'` respectively (custom
internal `@font-face` names, distinct from any system font that happens to
already be called "Helvetica," to avoid an ambiguous collision), each with
a fallback chain as a safety net in case a font upload is ever missing or
fails to load:

- `--font-family-citizen-base: 'TBHF-Helvetica', Helvetica, Arial, sans-serif;`
- `--font-family-citizen-serif: 'TBHF-NeueKabel', Helvetica, Arial, sans-serif;`
  (Neue Kabel has no common system-installed equivalent, so its fallback
  degrades straight to the same sans-serif stack as the body font, rather
  than to a serif — there is no serif anywhere in this typography system
  post-retheme, despite the `-serif` in the variable's name, which is
  Citizen's own naming and not renamed by this project.)

**Manual step (not a code deliverable of this plan):** the five font files
must be uploaded to the wiki as `File:Helvetica.ttf`,
`File:Helvetica-Bold.ttf`, `File:Helvetica-Oblique.ttf`,
`File:NeueKabel-Book.otf`, `File:NeueKabel-Bold.otf` — matching the exact
filenames the CSS's `Special:Redirect/file/` URLs reference. This project
documents the requirement and the exact filenames; it does not commit the
binary font files themselves (they belong to the TBHFDN repo/foundation,
not this skin repo).

## Logo

The masthead's text wordmark (`'''The Black History Foundation Wiki'''`)
is replaced with the real logo image:

```wikitext
[[File:TBHF-Logo.png|center|link=|alt=The Black History Foundation]]
```

styled via a new `.bhf-masthead__logo` CSS class (`max-height`, centered,
`display: block; margin: 0 auto`). The tagline text below it is unchanged.
Like the fonts, `TBHF_Logo_Full Color.png` must be uploaded manually as
`File:TBHF-Logo.png` — this project documents the requirement, not the
binary file.

## Testing / Validation Plan

- Unit/CSS tests (`node --test` against `citizen-theme.css`): the three new
  hex values appear in the correct token declarations; the exact Firebrick
  Red OKLCH triple; the gold-fill/espresso-text and
  green-fill/parchment-text contrast patterns still hold structurally (same
  CSS shape, new hex values); the new `@font-face` rules reference the
  exact expected `Special:Redirect/file/` filenames; `.bhf-masthead__logo`
  is defined.
- A documented (non-automated) manual-upload checklist: the 5 font files
  and 1 logo file, with their exact required filenames.
- Extend the smoke-test checklist: links/borders render Firebrick Red,
  badges render Gold/Dark Green fills (not text), headings render in Neue
  Kabel once uploaded (with a documented expectation of what the fallback
  looks like if not yet uploaded), masthead shows the real logo image
  instead of text.

## Open Items for Future Phases (explicitly out of scope here)

- Correcting tbhfdn.org's own "cruise theme" CSS discrepancy against its
  README (a TBHFDN-repo concern, not this project's).
- Uploading additional Neue Kabel/Helvetica weights beyond the five actually
  used, should a future component need them.
- Any deeper visual unification with tbhfdn.org (e.g. matching background
  colors) beyond the accent/typography/logo scope decided here.
