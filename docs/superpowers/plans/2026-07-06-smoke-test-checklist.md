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
- [ ] A test article shows the breadcrumb category tags under its title, and (when
      `verified=1` is passed) the gold "Sources verified" badge inline with them
- [ ] A test article shows the "Related pages"/"Part of timeline" block below the
      infobox
- [ ] The theme preferences panel has NO theme picker (forced light theme)
- [ ] Resizing the browser to a mobile width collapses the hero to a single column
      and the infobox to full-width, non-floated
- [ ] Browser console shows no JS errors on the Main Page or an article page
