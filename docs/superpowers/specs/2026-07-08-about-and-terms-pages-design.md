# About Project & Terms of Use Pages — Design

**Date:** 2026-07-08
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

Give the wiki two pages every project like this needs but this one doesn't
yet have: a page explaining what it is, why it exists, how to use it, and
how it's different from other places people already know (Wikipedia,
genealogy sites, other wikis, other Black history resources) — and a Terms
of Use page, since a wiki that accepts community contributions needs
explicit terms distinct from tbhfdn.org's own site terms.

## Scope

- `src/templates/AboutProject.wikitext` — a standalone page (not the Main
  Page, which stays exactly as the discovery-focused homepage already
  built), covering: what this is, why we built it, how to use it, our
  ultimate goal (including a narrative-only mention of a future Black
  History DAO connection), a competitive analysis, and how this serves
  TBHF's mission.
- `src/templates/TermsOfUse.wikitext` — a standalone page covering
  acceptance of terms, a content-license carve-out for wiki contributions,
  community conduct, an oral-history/confidence-rating disclaimer,
  third-party links, warranty disclaimer, limitation of liability, changes
  to terms, and contact — modeled on tbhfdn.org's existing Terms of Use
  structure where compatible, diverging explicitly where a wiki's
  contribution model requires it.
- A small amount of new CSS for both pages, reusing existing component
  shells (`.bhf-masthead`, card-style containers) rather than inventing a
  new visual language.
- Both pages linked from site navigation (alongside the existing Research
  Leads board link) and from the footer band's link columns.
- Out of scope: any actual legal vetting (this project drafts language, not
  legal advice — see the Terms of Use's own opening notice), any actual
  Black History DAO integration (narrative mention only, in the About
  page's "ultimate goal" section — no wallet/voting/blockchain code), any
  change to tbhfdn.org's own Terms of Use or About page.

## Scope Decisions

**Page placement:** a separate "About This Project" page, not a rework of
the Main Page — the Main Page already works as a discovery-focused
homepage and shouldn't be disrupted.

**Competitive analysis comparison set:** Wikipedia, Ancestry/FamilySearch,
Fandom-style wikis, and BlackPast.org specifically (not just the first
three) — each compared fairly, on what it actually does well, not
disparaged. The BlackPast.org comparison is based on general knowledge
(a direct fetch of blackpast.org returned an HTTP 403 during research) and
is flagged in this spec as **needing a fact-check pass** before publishing,
since it could not be verified against the live site.

**Content licensing conflict, resolved:** tbhfdn.org's existing Terms of
Use (Section 3, Intellectual Property) claims all site content is TBHF's
exclusive property with no reproduction without written consent. A wiki
fundamentally requires the opposite — contributors editing each other's
work, content being freely reshareable. The wiki's Terms of Use carves out
an explicit exception: **content contributed to the wiki is shared under
CC BY-SA** (the same model Wikipedia uses), distinct from and not
superseding tbhfdn.org's own site content, which remains under the main
site's existing terms.

**Black History DAO connection:** narrative-only for this project. The
About page's "ultimate goal" section describes the eventual vision — wiki
content maturing through the citation/confidence-rating and research-leads
systems already built, then becoming a candidate for Black History DAO's
community vote and permanent on-chain preservation (per bh-dao.vercel.app's
own described model: contributors submit → members vote over a 7-day
window → experts verify → on-chain anchoring). No integration code, wallet
connection, or voting logic is built here — a real integration is a future,
separately-scoped project.

## `AboutProject.wikitext` — Content

```wikitext
== What This Is ==

The Black History Foundation Wiki is a community-built archive for
discovering, researching, and sharing Black history — especially the
history that lives in family memory and community record before it ever
reaches an archive, a textbook, or a museum.

== Why We Built It ==

In 1860, the ''Clotilda'' — the last known ship to bring enslaved Africans
to the United States — arrived in Mobile Bay. The community of Africatown
that its survivors founded told the story of that ship for more than a
century. Historians dismissed it. It wasn't until 2019, when the wreck was
finally located and confirmed, that the outside world caught up to what
the community had known all along.

That gap — between what a community knows and what gets counted as
"verified" — is the reason this wiki exists. Community accounts, oral
histories, and family records don't need institutional permission to be
true. But they do need a place to be documented, discussed, corroborated,
and — when the evidence comes together — recognized. This wiki is that
place.

== How To Use It ==

* '''Browse''' the homepage's discovery rail for recently added and
  actively-researched articles, or browse by category (People, Places,
  Events, Eras).
* '''Research''' an article's Sources section to see what's backing a
  claim — every source is tagged with its type (archival document, oral
  history, newspaper, and more) and a confidence rating (verified,
  single-source, or disputed), so you always know how solid the ground is.
* '''Contribute''' what you know — a new article, a citation, a correction
  — and see your work reflected automatically on your contributor profile.
* '''Post a research lead''' for a story you believe but can't yet prove,
  tagged with exactly what it needs to move forward: archival access,
  translation, fieldwork, funding, expertise, or digitization.
* '''Discuss''' any article or lead on its Talk page.

== Our Ultimate Goal ==

Every unresolved research lead on this wiki represents a piece of history
still waiting on the resources to confirm it — the same gap that kept the
''Clotilda'' a community secret for over a hundred years. Our goal is to
close that gap faster, in the open, with the community doing the work.

Looking further ahead: as research on this wiki matures — corroborated,
discussed, sourced — the best of it should have a path to permanence
beyond this wiki. We intend for this wiki to eventually connect with
[https://bh-dao.vercel.app Black History DAO], where the community votes
on what gets permanently preserved on-chain. That connection doesn't exist
yet — this wiki's job today is to be the place where the research happens
and matures. The DAO's job, when the two connect, will be to make the
strongest of it permanent.

== How This Compares ==

{| class="wikitable"
! Site !! What it does well !! Where this wiki is different
|-
| Wikipedia || Broad, well-governed, general-purpose encyclopedia || No built-in way to track how confident a claim is, or to flag what unresolved history needs to move forward
|-
| Ancestry.com / FamilySearch || Deep genealogical records, family-tree tools || Built for tracing your own lineage, not for community discovery and discussion of shared history
|-
| Fandom-style wikis || Polished, community-editable, great discovery UX || Built for entertainment franchises — no concept of source confidence, oral-history disclaimers, or research needs
|-
| BlackPast.org || Respected, expert-written reference on Black history || Written and reviewed by historians, not community-editable — no place for a family's account to live while it's still being proven
|}

== How This Serves Our Mission ==

The Black History Foundation's mission is to empower the African diaspora
through education, cultural celebration, and the preservation of our
history — believing that protecting our past is the key to a stronger,
more unified future. This wiki puts that mission into practice across all
four of the Foundation's pillars: '''education''' (every article is a
teaching resource), '''technology''' (the citation and research-leads
tooling built into this wiki), '''cultural preservation''' (a home for
accounts that would otherwise stay undocumented), and '''community
engagement''' (research is done together, in the open, not behind an
institution's walls).
```

## `TermsOfUse.wikitext` — Content

```wikitext
<div class="bhf-legal-notice">
'''This page is a draft.''' It has not been reviewed by a lawyer. Do not
treat this as final or legally binding until The Black History Foundation
has had these terms reviewed by qualified legal counsel.
</div>

''Last updated: {{CURRENTMONTHNAME}} {{CURRENTYEAR}}''

== 1. Acceptance of Terms ==

By accessing and using this wiki, you accept and agree to be bound by
these Terms of Use. If you do not agree to these terms, please do not use
this wiki. These terms apply specifically to this wiki and are separate
from — and do not replace — the [https://www.tbhfdn.org/terms-of-use
Terms of Use] for The Black History Foundation's main website.

== 2. Contributing to This Wiki ==

Unlike the main tbhfdn.org website, this wiki is built on community
contribution. By submitting an article, citation, research lead, or any
other content to this wiki, you agree to license your contribution under
the [https://creativecommons.org/licenses/by-sa/4.0/ Creative Commons
Attribution-ShareAlike 4.0 License] (CC BY-SA) — the same open license
Wikipedia uses. This means your contribution can be freely reused, edited,
and reshared by others, including outside this wiki, as long as they give
appropriate credit and share any changes under the same license. This
license applies only to content contributed to this wiki, not to
tbhfdn.org's own site content, which remains under the main site's Terms
of Use.

== 3. Community Conduct ==

You agree to use this wiki for lawful purposes only, to contribute in good
faith, and not to submit content that is knowingly false, defamatory, or
infringes on someone else's rights. Vandalism, harassment, and bad-faith
editing may result in your contributions being reverted and your access
restricted.

== 4. Oral History & Community Accounts ==

This wiki exists specifically to hold community accounts and oral
histories that may not yet have institutional or archival confirmation.
Every source on this wiki is tagged with a confidence rating —
'''verified''', '''single-source''', or '''disputed''' — so readers can see
at a glance how well-corroborated a claim is. A single-source or disputed
account is presented as a community record, not as verified fact. We make
no representation that any un-verified account is accurate, and we
encourage readers to check a source's confidence rating before treating
any claim as settled.

== 5. Third-Party Links ==

This wiki may contain links to third-party websites, including
tbhfdn.org, Black History DAO, and sources cited in articles. We are not
responsible for the content, privacy practices, or availability of these
external sites. The inclusion of any link does not imply endorsement.

== 6. Disclaimer of Warranties ==

This wiki is provided "as is" without warranties of any kind, either
express or implied. We do not warrant that the wiki will be uninterrupted,
error-free, or that any community-contributed content is accurate or
complete.

== 7. Limitation of Liability ==

To the fullest extent permitted by law, The Black History Foundation shall
not be liable for any indirect, incidental, special, consequential, or
punitive damages arising from your use of this wiki or reliance on any
content within it.

== 8. Changes to These Terms ==

We reserve the right to modify these Terms of Use at any time. Changes
will be effective immediately upon posting to this wiki. Your continued
use of the wiki after any changes constitutes acceptance of the modified
terms.

== 9. Contact ==

If you have questions about these Terms of Use, please contact us through
[https://www.tbhfdn.org/contact our contact page].
```

## CSS

Both pages reuse existing component classes (`.bhf-masthead` for the page
header, standard MediaWiki `wikitable` styling for the comparison table —
no new table component needed). One new class:

```css
.bhf-legal-notice {
	background-color: var( --color-surface-1 );
	border: 1px solid var( --bhf-color-accent-terracotta );
	border-left: 4px solid var( --bhf-color-accent-terracotta );
	border-radius: 6px;
	padding: 0.75rem 1rem;
	margin-bottom: 1rem;
	font-weight: 600;
}
```

reusing the terracotta accent already established for cautionary/attention
content (the same accent used for the contribute-prompt's dashed border).

## Navigation

Both pages are linked from the footer band's "About Us" column (already
built in the base theme — `.bhf-footer-band__links`) alongside the
existing About/Contact links, and from the Research Leads board's page (a
one-line addition, not a new nav component).

## Testing / Validation Plan

- CSS test (`node --test` against `citizen-theme.css`) confirming
  `.bhf-legal-notice` is defined using the established terracotta token.
- No JS is involved in this project — both pages are static wikitext, so
  there's no pure-function/bootstrap split to test.
- Manual smoke-test checklist addition: both pages render with working
  internal/external links, the comparison table displays correctly, and
  the legal-review notice is visually prominent (not easy to miss).

## Open Items for Future Phases (explicitly out of scope here)

- Actual legal review of the Terms of Use by qualified counsel.
- A fact-check pass on the BlackPast.org comparison (flagged above as
  based on general knowledge, not a verified live fetch).
- Any real Black History DAO integration (wallet connection, voting,
  on-chain anchoring) — narrative mention only in this project.
- Correcting tbhfdn.org's own Terms of Use or About page content (a
  TBHFDN-repo concern, not this project's).
