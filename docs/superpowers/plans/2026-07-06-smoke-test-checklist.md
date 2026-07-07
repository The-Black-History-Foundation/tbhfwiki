# Smoke test checklist

- [ ] Main Page loads with parchment background and paper-grain texture visible
- [ ] Headings render in Source Serif 4, body text in Source Sans 3, no visible
      font-flicker/layout shift on load
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
