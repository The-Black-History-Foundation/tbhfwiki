# Smoke test checklist

- [ ] Main Page loads with parchment background and paper-grain texture visible
- [ ] Headings render in Neue Kabel, body text in Helvetica, no visible
      font-flicker/layout shift on load (superseded by the TBHF brand
      re-theme — see the "Required asset uploads" section below; no longer
      Source Serif 4 / Source Sans 3)
- [ ] Category tiles show espresso text on a gold background (not gold text)
- [ ] Discovery rail's "Recently Added" column populates with the test articles
- [ ] Discovery rail's "Trending" column is HIDDEN (PageViewInfo is not installed
      in this local stack) — confirms graceful degradation
- [ ] A Person-type infobox, Place-type infobox, and Event-type infobox each render
      with the correct type label and shared gold-bordered shell
- [ ] A pull-quote renders with gold left-border and italic serif text
- [ ] The homepage footer band shows the contribute CTA and About/Get-Involved link
      columns
- [ ] A test article shows the dashed terracotta-bordered "Know more about this?"
      contribute prompt
- [ ] A test article shows the breadcrumb category tags under its title
- [ ] A test article with a `== Sources ==` section containing at least one
      `{{Citation}}` shows the gold "Sources cited" badge automatically (no manual
      parameter needed)
- [ ] A test article with NO `{{Citation}}` entries shows no gold badge
- [ ] Adding `[[Category:Reviewed]]` to a test article shows the green "Reviewer
      confirmed" badge alongside (or independently of) the gold badge
- [ ] A citation with `confidence=disputed` still counts toward the gold badge, and
      displays its terracotta "Disputed" tag within the Sources section
- [ ] Each of the six citation types (`archival`, `newspaper`, `book`,
      `oral-history`, `record`, `photo`) renders its distinct type label
- [ ] A test article shows the "Related pages"/"Part of timeline" block below the
      infobox
- [ ] The theme preferences panel has NO theme picker (forced light theme)
- [ ] Resizing the browser to a mobile width collapses the hero to a single column
      and the infobox to full-width, non-floated
- [ ] Browser console shows no JS errors on the Main Page or an article page
- [ ] A `User:` page with `{{ContributorProfile}}` shows the bio and up to 5
      interest tags
- [ ] A `User:` page with a `featured` article set shows the featured-article
      mini-card, linking to that article
- [ ] For a user with edit history, the stats line populates automatically
      with "N articles contributed", a citation count, and a last-active date
      — no manual entry required
- [ ] For a brand-new user with zero edits, the stats slot shows NOTHING (not
      a broken "0 articles" state)
- [ ] A "Recently Added" discovery-rail card's contributor name is a link to
      their `User:` page, and the article title is a SEPARATE link — clicking
      each goes to the right place, and the browser's dev tools show no
      nested `<a>` tags in that card's markup
- [ ] A Trending card (no `userUrl`) still shows its contributor/views text
      as plain, non-linked text
- [ ] A lead page with `{{ResearchLead|status=open|needed1=archival|needed2=fieldwork|...}}`
      shows the summary, known-so-far text, both need tags with their labels
      (not raw parameter values), an "Open" gold status badge, and a working
      "Discuss this lead" link to its Talk page
- [ ] The lead page's category footer includes "Research Leads", "Needs
      Archival Access", "Needs Fieldwork", and "Lead Status Open" (invisible
      in the card itself, visible in the standard MediaWiki category footer)
- [ ] The Research Leads board page shows that same lead under BOTH the
      "Needs Archival Access" and "Needs Fieldwork" groups
- [ ] Changing that lead's `status` to `resolved` and re-saving removes it
      from the board entirely, even though its need-categories haven't
      changed
- [ ] A lead with no `neededN` values set shows no need tags, and does not
      appear in any group on the board (only in `Category:Research Leads`
      directly)
- [ ] Browser console shows no JS errors on the Leads Board page, including
      when zero leads are currently open (empty board, not a broken one)

## Required asset uploads for the TBHF brand re-theme

Before running the checklist items below, upload these 6 files to the wiki
as `File:` pages (Special:Upload), using these EXACT filenames — the CSS's
`Special:Redirect/file/` URLs and the Main Page's `[[File:TBHF-Logo.png]]`
reference these names literally:

- `File:Helvetica.ttf` — from TBHFDN's `public/Fonts/Helvetica/Helvetica.ttf`
- `File:Helvetica-Bold.ttf` — from `public/Fonts/Helvetica/Helvetica-Bold.ttf`
- `File:Helvetica-Oblique.ttf` — from `public/Fonts/Helvetica/Helvetica-Oblique.ttf`
- `File:NeueKabel-Book.otf` — from `public/Fonts/Neue-Kabel/NeueKabel-Book.otf`
- `File:NeueKabel-Bold.otf` — from `public/Fonts/Neue-Kabel/NeueKabel-Bold.otf`
- `File:TBHF-Logo.png` — from `public/Logos/TBHF_Logo_Full Color.png`

- [ ] Links and borders across the site render in Firebrick Red (not the
      old deep brown)
- [ ] The gold "Sources cited" badge, category tiles, and lead "Open"
      status badge all show espresso text on a bright gold (`#FFD700`)
      background — never gold as small text
- [ ] The "Reviewer confirmed" badge, "resolved" lead status, and verified
      citation confidence tag all render in Dark Green
- [ ] A disputed citation tag, an in-progress lead status badge, and the
      dashed contribute-prompt border all render in Firebrick Red (the
      same red as links — this is the intended terracotta-to-red merge,
      not a bug)
- [ ] Headings render in Neue Kabel and body text in Helvetica once the
      5 font files are uploaded — if a font isn't uploaded yet, that
      role should cleanly fall back to system Helvetica/Arial, not show
      a broken/missing-glyph state
- [ ] The Main Page masthead shows the real TBHF logo image, centered,
      capped at 80px tall — not the old text wordmark
- [ ] Parchment backgrounds, espresso body text, and borders are
      UNCHANGED from before this re-theme
