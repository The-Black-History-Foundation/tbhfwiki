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
- [ ] `Template:ResearchLead` itself does NOT appear as a phantom entry on
      the Research Leads board or in `Category:Research Leads` (confirms
      the `<includeonly>` wrapper around its categorization is intact —
      without it, viewing the template's own definition page applies its
      `[[Category:...]]` tags to the template page itself, a bug only
      found once this checklist was actually run against a live wiki)

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

## About This Wiki & Terms of Use pages

No asset uploads required for these checks — both pages render correctly
without any of the font/logo files above.

- [ ] The "About This Wiki" page renders all six sections, the comparison
      table displays as a proper table (not raw wikitext), and every
      internal/external link resolves correctly
- [ ] The "Terms of Use" page's draft/legal-review notice is the first
      thing visible on the page and is visually distinct (bordered
      callout), not easy to miss
- [ ] Both pages are reachable from the Main Page footer's "About Us"
      column and from the Research Leads board page

## Homepage redesign

- [ ] The hero banner shows the featured article and a search panel side
      by side (stacked on mobile widths)
- [ ] Typing a query into the hero search box and submitting lands on
      real `Special:Search` results with actual matches — not a broken
      link or a 404
- [ ] The "Why This Archive Exists" mission band renders between the hero
      banner and the discovery rail, and its "Read our full story" link
      reaches the real "About This Wiki" page
- [ ] Discovery rail cards render as a grid (not a single stacked column)
      on desktop widths, each with a visible gold border
- [ ] Category tiles show an icon above the label, and a hover/focus state
      that visibly lifts the tile (not just a color change)
- [ ] The sidebar shows "Explore the Archive" and "About and Contribute"
      section headings (not MediaWiki's default "Navigation")
- [ ] Every sidebar link under both new sections goes to a working page
      (no red links, no 404s)
- [ ] The sidebar's Search and Tools sections still work exactly as
      before (unaffected by this redesign)

## Evidence Explorer

- [ ] A page with `{{Evidence}}` entries in multiple categories —
      including at least one entry typed directly `Primary Documents` and
      at least one entry typed `Government Records` — shows a single
      collapsible "Evidence (N sources)" panel with `Primary Documents`
      first (its direct entries, then its `Government Records` subheading),
      followed by any standalone categories present
- [ ] Categories and subcategories with zero entries do not appear as empty
      headings anywhere in the panel
- [ ] With JavaScript disabled, the plain `{{Evidence}}` entries remain
      visible inline, ungrouped, exactly where the editor placed them — no
      panel appears
- [ ] With JavaScript enabled, each source appears exactly once (inside the
      panel) — the original inline entries are hidden, not also visible
- [ ] The panel's `<summary>` toggle opens and closes the panel with no
      JavaScript required for that specific interaction
- [ ] A page with zero `{{Evidence}}` entries shows no panel at all
- [ ] The "Sources cited" gold badge still appears automatically on any
      page with at least one `{{Evidence}}` entry, and the "Reviewer
      confirmed" green badge still appears independently from
      `[[Category:Reviewed]]` — both badges work exactly as they did before
      this feature
- [ ] Viewing `Template:Evidence` directly does NOT add it to
      `Category:Evidence` (confirms the `<includeonly>` wrapper is intact)
- [ ] Browser console shows no JS errors on an article with an Evidence
      panel
