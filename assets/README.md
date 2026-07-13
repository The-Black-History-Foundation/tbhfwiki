# Wiki assets

Upload these files to the MediaWiki wiki before applying the theme.

## Fonts (upload as File: pages)

Upload from `fonts/` with these exact filenames (referenced in `src/citizen-theme.css`):

| Local file | Upload as |
|------------|-----------|
| `Helvetica.ttf` | `File:Helvetica.ttf` |
| `Helvetica-Bold.ttf` | `File:Helvetica-Bold.ttf` |
| `Helvetica-Oblique.ttf` | `File:Helvetica-Oblique.ttf` |
| `NeueKabel-Book.otf` | `File:NeueKabel-Book.otf` |
| `NeueKabel-Bold.otf` | `File:NeueKabel-Bold.otf` |

## Logos

| Local file | Upload as | Used by |
|------------|-----------|---------|
| `logos/TBHF-Logo.png` | `File:TBHF-Logo.png` | Main Page masthead |
| `logos/TBHF_Main_Text.png` | Reference for wordmark | Optional |
| `logos/TBHF_Main_Icon.png` | Reference for icon | Optional |

For `$wgLogos` in `LocalSettings-snippet.php`, place SVG/PNG wordmark and icon files at:

- `resources/assets/tbhfdn-wordmark.svg` (or `.png`)
- `resources/assets/tbhfdn-icon.svg` (or `.png`)

on the MediaWiki server, or update the paths in the snippet after upload.
