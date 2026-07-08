# About Project & Terms of Use Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two standalone content pages — an "About This Wiki" page
(what this is, why it exists, how to use it, competitive analysis, mission
alignment) and a "Terms of Use" page — linked from site navigation, without
touching the existing discovery-focused Main Page or Research Leads board
layouts.

**Architecture:** Pure content + minimal CSS. No JS, no new
pure-function/bootstrap pair — this is a wikitext-and-one-CSS-class
project, following the same `src/templates/*.wikitext` pattern already
established by every earlier feature.

**Tech Stack:** MediaWiki wikitext (standard `wikitable` markup for the
comparison table — no custom table CSS needed), one new CSS class in the
shared `src/citizen-theme.css`, Node's built-in test runner for the CSS
test.

## Global Constraints

- The Main Page and Research Leads board keep their existing layouts —
  both new pages are separate, linked from navigation, not merged into
  either existing page.
- `TermsOfUse.wikitext` MUST open with a clearly visible notice that the
  page is an unreviewed draft, not legal advice, and needs qualified legal
  counsel before the wiki goes live with it — this is non-negotiable content,
  not something to soften or omit.
- Wiki contributions are licensed CC BY-SA — explicitly distinct from, and
  not superseding, tbhfdn.org's own site content under its existing Terms
  of Use.
- The Black History DAO and Charity Coin mentions in the About page are
  narrative-only — external links describing a stated future direction,
  not functional integrations. Do not add any wallet, voting, or payment
  code.
- The BlackPast.org comparison in the About page's competitive-analysis
  table is based on general knowledge (a live fetch returned HTTP 403
  during research) — ship it as written, but it's flagged in the spec as
  needing a fact-check pass before publishing; don't silently harden the
  claim into something more specific than what's in this plan.
- `.bhf-legal-notice` must reference `var(--bhf-color-accent-terracotta)`,
  not a hardcoded hex value — this keeps the class correct regardless of
  whether the (separately-planned, independently-ordered) TBHF brand
  re-theme has run yet, since that project changes what hex value the
  terracotta variable resolves to.

---

### Task 1: Legal-notice CSS + the About This Wiki page

**Files:**
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)
- Create: `src/templates/AboutProject.wikitext`

**Interfaces:**
- Produces: `.bhf-legal-notice` CSS class, consumed by this task's own page
  and by Task 2's Terms of Use page.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the legal-notice callout using the terracotta accent variable, not a hardcoded color', () => {
  const block = css.match(/\.bhf-legal-notice\s*{[^}]*}/s)[0];
  assert.match(block, /border-left:.*var\(\s*--bhf-color-accent-terracotta\s*\)/);
  assert.match(block, /border:.*var\(\s*--bhf-color-accent-terracotta\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-legal-notice` not defined yet.

- [ ] **Step 3: Add the CSS**

```css
/* Append to src/citizen-theme.css */

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

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Write the About This Wiki page**

```wikitext
<!-- src/templates/AboutProject.wikitext — paste as the content of a new
    page titled "About This Wiki", then link to it from site navigation. -->
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

Some leads need more than research time — they need money for an archive
visit, a translator, a dive team, an expert consultation. Every research
lead on this wiki that's tagged as needing funding is already built to
carry a link to a specific fundraising campaign for that exact need. We
intend for those links to eventually connect to Charity Coin, a fundraising
platform we're building to support projects like this one. That connection
doesn't exist yet either — but the moment it does, the path from "we know
this happened, we just can't prove it yet" to "here's exactly how to help
prove it" will be a single click.

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

- [ ] **Step 6: Commit**

```bash
git add src/citizen-theme.css tests/citizen-theme.test.js src/templates/AboutProject.wikitext
git commit -m "feat: add legal-notice CSS and the About This Wiki page"
```

---

### Task 2: Terms of Use page

**Files:**
- Create: `src/templates/TermsOfUse.wikitext`

**Interfaces:**
- Consumes: `.bhf-legal-notice` from Task 1.

- [ ] **Step 1: Write the page**

```wikitext
<!-- src/templates/TermsOfUse.wikitext — paste as the content of a new
    page titled "Terms of Use", then link to it from site navigation. -->
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

- [ ] **Step 2: Manual verification note**

This is a static content page with no automated test beyond Task 1's CSS
test (already covering `.bhf-legal-notice`, which this page consumes).
Verify by reading: confirm the notice div is the very first thing in the
file (so it renders at the top of the page, unmissable), and confirm every
`[[...]]`/`[http...]` link target is spelled correctly.

- [ ] **Step 3: Commit**

```bash
git add src/templates/TermsOfUse.wikitext
git commit -m "feat: add Terms of Use page with CC BY-SA contribution license"
```

---

### Task 3: Navigation links

**Files:**
- Modify: `src/templates/MainPage.wikitext:31-39` (the footer band's links)
- Modify: `src/templates/LeadsBoard.wikitext` (append)
- Modify: `README.md` (the templates table)

**Interfaces:**
- Consumes: the page titles "About This Wiki" and "Terms of Use" that
  Tasks 1-2's content will be pasted under.

- [ ] **Step 1: Update the Main Page footer band**

In `src/templates/MainPage.wikitext`, replace:

```wikitext
<div class="bhf-footer-band__links">
'''About Us'''

[[About]] &middot; [[Contact]]

'''Get Involved'''

[https://www.tbhfdn.org/donate Donate] &middot; [[Help:Contributing|Contribute]]
</div>
```

with:

```wikitext
<div class="bhf-footer-band__links">
'''About Us'''

[[About]] &middot; [[Contact]] &middot; [[About This Wiki]] &middot; [[Terms of Use]]

'''Get Involved'''

[https://www.tbhfdn.org/donate Donate] &middot; [[Help:Contributing|Contribute]]
</div>
```

- [ ] **Step 2: Add a link from the Research Leads board**

In `src/templates/LeadsBoard.wikitext`, append after the existing content:

```wikitext

''See also: [[About This Wiki|About this project]] &middot; [[Terms of Use]]''
```

- [ ] **Step 3: Update the README's template table**

In `README.md`, replace:

```markdown
| `LeadsBoard.wikitext` | Any page you link from navigation (e.g. "Research Leads") |

### Optional extensions
```

with:

```markdown
| `LeadsBoard.wikitext` | Any page you link from navigation (e.g. "Research Leads") |
| `AboutProject.wikitext` | A page titled `About This Wiki` |
| `TermsOfUse.wikitext` | A page titled `Terms of Use` |

### Optional extensions
```

(this appends the two new rows immediately after the existing last row and
before the next heading, matching the backtick-quoted style every other
row in this table already uses)

- [ ] **Step 4: Commit**

```bash
git add src/templates/MainPage.wikitext src/templates/LeadsBoard.wikitext README.md
git commit -m "feat: link the About This Wiki and Terms of Use pages from navigation"
```

---

### Task 4: Extend the smoke-test checklist

**Files:**
- Modify: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1-3.

- [ ] **Step 1: Update the checklist**

Append to `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`:

```markdown
- [ ] The "About This Wiki" page renders all six sections, the comparison
      table displays as a proper table (not raw wikitext), and every
      internal/external link resolves correctly
- [ ] The "Terms of Use" page's draft/legal-review notice is the first
      thing visible on the page and is visually distinct (bordered
      callout), not easy to miss
- [ ] Both pages are reachable from the Main Page footer's "About Us"
      column and from the Research Leads board page
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for the About This Wiki and Terms of Use pages"
```

## Post-plan follow-ups (not part of this plan)

- Actual legal review of the Terms of Use by qualified counsel.
- A fact-check pass on the BlackPast.org comparison (based on general
  knowledge, not a verified live fetch, per the spec).
- Any real Black History DAO or Charity Coin integration — narrative
  mentions only in this project.
- Running the extended smoke-test checklist against a real MediaWiki +
  Citizen instance (same outstanding human follow-up as every earlier
  feature).
