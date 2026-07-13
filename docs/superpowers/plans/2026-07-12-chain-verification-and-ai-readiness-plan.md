# Blockchain Verification & AI-Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional, inert-by-default chain-verification fields (with a
visible badge once anchored) and an explicit AI-training consent field to
`{{Evidence}}` and `{{ResearchLead}}`, plus the matching public disclosure
on the Terms of Use and About pages.

**Architecture:** Wikitext template and content additions only — no new
JS pure functions, no new bootstrap files, no new backend/export tooling.
`evidence-panel.js`'s existing grouping/rendering logic is untouched; the
new fields ride along as additional `data-*` attributes it simply doesn't
read, the same way it already tolerates `citation` being absent.

**Tech Stack:** MediaWiki wikitext (`{{#ifeq:}}` for the badge condition),
CSS custom properties (reusing the existing brand palette), Node's
built-in test runner for the one CSS assertion this plan adds.

## Global Constraints

- All new fields are optional and inert by default — omitting them must
  produce byte-for-byte the same rendered output as today.
- `chainStatus` values: `none` (default/omitted), `pending`, `anchored`.
  The "On-Chain Verified" badge renders ONLY when `chainStatus=anchored`.
- `chainNetwork` and `chainTxHash` are separate fields, not one combined
  string.
- `aiConsent` values: `yes` or anything else (including omitted), which
  means no. This field renders nothing visible on either template — it is
  stored-only, matching `campaignUrl`'s existing inert precedent on
  `ResearchLead.wikitext`.
- The on-chain badge CSS must use `var(--bhf-color-accent-primary)`, NOT
  `var(--bhf-color-success)` — chain verification is a visually distinct
  claim from editorial `reliability=verified`, not a duplicate of it.
- No actual DAO/IPFS/export integration anywhere in this plan — every new
  field is either inert storage or a client-side link built from static
  wikitext, never a live network call.
- The Terms of Use's new section must include all three considerations:
  consent is not retroactively revocable once a model is trained, the
  contributor must attest to speaking for anyone whose account is
  recorded, and the field is entirely separate from the CC BY-SA
  contribution license.

---

### Task 1: Chain-verification fields and badge on `Evidence.wikitext`

**Files:**
- Modify: `src/templates/Evidence.wikitext`
- Modify: `src/citizen-theme.css` (append)
- Modify: `tests/citizen-theme.test.js` (append)

**Interfaces:**
- Produces: `.bhf-evidence-entry__chain-badge` CSS class; 6 new
  `data-evidence-chain-*`/`data-evidence-dao-proposal-id`/
  `data-evidence-ipfs-cid` attributes on the entry wrapper div (exact
  names below) — not consumed by any JS in this plan, available for a
  future feature to read.

- [ ] **Step 1: Write the failing test**

```js
// append to tests/citizen-theme.test.js
test('defines the on-chain verification badge using the primary brand accent, distinct from the reliability-verified color', () => {
  const block = css.match(/\.bhf-evidence-entry__chain-badge\s*{[^}]*}/s)[0];
  assert.match(block, /background-color:\s*var\(\s*--bhf-color-accent-primary\s*\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/citizen-theme.test.js`
Expected: FAIL — `.bhf-evidence-entry__chain-badge` not defined yet.

- [ ] **Step 3: Add the CSS**

In `src/citizen-theme.css`, find the existing `.bhf-evidence-entry__citation`
block:

```css
.bhf-evidence-entry__citation {
	font-size: 0.8rem;
	color: var( --color-subtle );
	font-style: italic;
	margin-top: 0.3rem;
}
```

Append immediately after it:

```css

.bhf-evidence-entry__chain-badge {
	display: inline-block;
	background-color: var( --bhf-color-accent-primary );
	color: var( --color-surface-0 );
	font-size: 0.7rem;
	font-weight: 600;
	text-decoration: none;
	padding: 0.15rem 0.6rem;
	border-radius: 999px;
	margin-top: 0.3rem;
	margin-left: 0.4rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/citizen-theme.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Update the Evidence template**

In `src/templates/Evidence.wikitext`, replace the entire current file
content:

```wikitext
<!-- src/templates/Evidence.wikitext — paste as Template:Evidence
    Usage: {{Evidence|title=...|type=...|date=...|repository=...
    |reliability=...|citation=...}}
    Required: title, type, reliability
    type must be one of: Primary Documents, Government Records,
    Land Records, Military Records, Maps, Letters, Newspapers, Books,
    Academic Papers, Oral Histories, DNA Studies, Archaeology
    reliability must be one of: verified, single-source, disputed
    Optional: date, repository, citation (a formatted reference string,
    e.g. "Smith, J. (1830). Deed Book 12, p. 45."), scanUrl (reserved for
    future digital-scan support — accepted but not yet rendered anywhere) -->
<div class="bhf-evidence-entry"
     data-evidence-title="{{{title}}}"
     data-evidence-type="{{{type}}}"
     data-evidence-date="{{{date|}}}"
     data-evidence-repository="{{{repository|}}}"
     data-evidence-reliability="{{{reliability}}}"
     data-evidence-citation="{{{citation|}}}">
<span class="bhf-evidence-entry__title">{{{title}}}</span>
<span class="bhf-evidence-entry__meta">{{{type}}}{{#if:{{{date|}}}| &middot; {{{date}}}}}{{#if:{{{repository|}}}| &middot; {{{repository}}}}}</span>
<span class="bhf-evidence-entry__reliability bhf-evidence-entry__reliability--{{{reliability}}}">{{#switch:{{{reliability}}}|verified=Verified|single-source=Single source|disputed=Disputed|#default={{{reliability}}}}}</span>
{{#if:{{{citation|}}}|<div class="bhf-evidence-entry__citation">{{{citation}}}</div>}}
</div>
<includeonly>[[Category:Evidence]]</includeonly>
```

with:

```wikitext
<!-- src/templates/Evidence.wikitext — paste as Template:Evidence
    Usage: {{Evidence|title=...|type=...|date=...|repository=...
    |reliability=...|citation=...}}
    Required: title, type, reliability
    type must be one of: Primary Documents, Government Records,
    Land Records, Military Records, Maps, Letters, Newspapers, Books,
    Academic Papers, Oral Histories, DNA Studies, Archaeology
    reliability must be one of: verified, single-source, disputed
    Optional: date, repository, citation (a formatted reference string,
    e.g. "Smith, J. (1830). Deed Book 12, p. 45."), scanUrl (reserved for
    future digital-scan support — accepted but not yet rendered anywhere).
    Optional chain-verification fields, all inert unless
    chainStatus=anchored (in which case an "On-Chain Verified" badge
    renders): chainStatus (none|pending|anchored), daoProposalId, ipfsCid,
    chainNetwork (e.g. "Paseo"), chainTxHash, chainVerifiedDate. Anchoring
    is intended for verified/single-source evidence, not disputed — not
    technically enforced, just the intended use. -->
<div class="bhf-evidence-entry"
     data-evidence-title="{{{title}}}"
     data-evidence-type="{{{type}}}"
     data-evidence-date="{{{date|}}}"
     data-evidence-repository="{{{repository|}}}"
     data-evidence-reliability="{{{reliability}}}"
     data-evidence-citation="{{{citation|}}}"
     data-evidence-chain-status="{{{chainStatus|}}}"
     data-evidence-dao-proposal-id="{{{daoProposalId|}}}"
     data-evidence-ipfs-cid="{{{ipfsCid|}}}"
     data-evidence-chain-network="{{{chainNetwork|}}}"
     data-evidence-chain-tx-hash="{{{chainTxHash|}}}"
     data-evidence-chain-verified-date="{{{chainVerifiedDate|}}}">
<span class="bhf-evidence-entry__title">{{{title}}}</span>
<span class="bhf-evidence-entry__meta">{{{type}}}{{#if:{{{date|}}}| &middot; {{{date}}}}}{{#if:{{{repository|}}}| &middot; {{{repository}}}}}</span>
<span class="bhf-evidence-entry__reliability bhf-evidence-entry__reliability--{{{reliability}}}">{{#switch:{{{reliability}}}|verified=Verified|single-source=Single source|disputed=Disputed|#default={{{reliability}}}}}</span>
{{#ifeq:{{{chainStatus|}}}|anchored|<a class="bhf-evidence-entry__chain-badge" href="https://{{{chainNetwork}}}.subscan.io/extrinsic/{{{chainTxHash}}}">⛓ On-Chain Verified →</a>|}}
{{#if:{{{citation|}}}|<div class="bhf-evidence-entry__citation">{{{citation}}}</div>}}
</div>
<includeonly>[[Category:Evidence]]</includeonly>
```

- [ ] **Step 6: Commit**

```bash
git add src/templates/Evidence.wikitext src/citizen-theme.css tests/citizen-theme.test.js
git commit -m "feat: add chain-verification fields and On-Chain Verified badge to Evidence"
```

---

### Task 2: `aiConsent` field on `Evidence.wikitext` and `ResearchLead.wikitext`

**Files:**
- Modify: `src/templates/Evidence.wikitext`
- Modify: `src/templates/ResearchLead.wikitext`

**Interfaces:**
- Consumes: nothing from Task 1 beyond the same file.
- Produces: `data-evidence-ai-consent` and `data-lead-ai-consent`
  attributes — inert, not read by any JS in this plan, same precedent as
  `campaignUrl` on `ResearchLead.wikitext` today.

No automated test for this task — this field renders no visible output on
either template (matching the existing untested precedent for `scanUrl`
and `campaignUrl`, both also inert stored-only fields). Verify manually per
Step 3 below.

- [ ] **Step 1: Update the Evidence template's header comment and data attributes**

In `src/templates/Evidence.wikitext`, replace:

```wikitext
    Optional chain-verification fields, all inert unless
    chainStatus=anchored (in which case an "On-Chain Verified" badge
    renders): chainStatus (none|pending|anchored), daoProposalId, ipfsCid,
    chainNetwork (e.g. "Paseo"), chainTxHash, chainVerifiedDate. Anchoring
    is intended for verified/single-source evidence, not disputed — not
    technically enforced, just the intended use. -->
<div class="bhf-evidence-entry"
     data-evidence-title="{{{title}}}"
     data-evidence-type="{{{type}}}"
     data-evidence-date="{{{date|}}}"
     data-evidence-repository="{{{repository|}}}"
     data-evidence-reliability="{{{reliability}}}"
     data-evidence-citation="{{{citation|}}}"
     data-evidence-chain-status="{{{chainStatus|}}}"
     data-evidence-dao-proposal-id="{{{daoProposalId|}}}"
     data-evidence-ipfs-cid="{{{ipfsCid|}}}"
     data-evidence-chain-network="{{{chainNetwork|}}}"
     data-evidence-chain-tx-hash="{{{chainTxHash|}}}"
     data-evidence-chain-verified-date="{{{chainVerifiedDate|}}}">
```

with:

```wikitext
    Optional chain-verification fields, all inert unless
    chainStatus=anchored (in which case an "On-Chain Verified" badge
    renders): chainStatus (none|pending|anchored), daoProposalId, ipfsCid,
    chainNetwork (e.g. "Paseo"), chainTxHash, chainVerifiedDate. Anchoring
    is intended for verified/single-source evidence, not disputed — not
    technically enforced, just the intended use.
    Optional aiConsent field (yes|anything else/omitted = no): agreeing
    that this entry may be used to train an AI model, separate from the
    CC BY-SA license covering general reuse. Renders nothing visible — see
    Terms of Use section 10 for the full explanation before using this
    field. -->
<div class="bhf-evidence-entry"
     data-evidence-title="{{{title}}}"
     data-evidence-type="{{{type}}}"
     data-evidence-date="{{{date|}}}"
     data-evidence-repository="{{{repository|}}}"
     data-evidence-reliability="{{{reliability}}}"
     data-evidence-citation="{{{citation|}}}"
     data-evidence-chain-status="{{{chainStatus|}}}"
     data-evidence-dao-proposal-id="{{{daoProposalId|}}}"
     data-evidence-ipfs-cid="{{{ipfsCid|}}}"
     data-evidence-chain-network="{{{chainNetwork|}}}"
     data-evidence-chain-tx-hash="{{{chainTxHash|}}}"
     data-evidence-chain-verified-date="{{{chainVerifiedDate|}}}"
     data-evidence-ai-consent="{{{aiConsent|}}}">
```

- [ ] **Step 2: Update the ResearchLead template's header comment and data attributes**

In `src/templates/ResearchLead.wikitext`, replace:

```wikitext
<!-- src/templates/ResearchLead.wikitext — paste as Template:ResearchLead
    Usage: {{ResearchLead|summary=...|known=...|needed1=archival|needed2=fieldwork|status=open}}
    Required: summary, status (open|in-progress|resolved)
    Optional: known, needed1 through needed3 (archival|translation|fieldwork|
    funding|expertise|digitization, one per slot, not pipe-separated),
    campaignUrl (a future Charity Coin link — only meaningful when one of
    needed1-needed3 is funding; not required, not yet used anywhere) -->
<div class="bhf-lead">
```

with:

```wikitext
<!-- src/templates/ResearchLead.wikitext — paste as Template:ResearchLead
    Usage: {{ResearchLead|summary=...|known=...|needed1=archival|needed2=fieldwork|status=open}}
    Required: summary, status (open|in-progress|resolved)
    Optional: known, needed1 through needed3 (archival|translation|fieldwork|
    funding|expertise|digitization, one per slot, not pipe-separated),
    campaignUrl (a future Charity Coin link — only meaningful when one of
    needed1-needed3 is funding; not required, not yet used anywhere).
    Optional aiConsent field (yes|anything else/omitted = no): agreeing
    that this lead may be used to train an AI model, separate from the
    CC BY-SA license covering general reuse. Renders nothing visible — see
    Terms of Use section 10 for the full explanation before using this
    field. -->
<div class="bhf-lead" data-lead-ai-consent="{{{aiConsent|}}}">
```

- [ ] **Step 3: Manual verification**

Run the full test suite to confirm nothing regressed (this task adds no
new tests, so this is a pure regression check):

```bash
node --test tests/citizen-theme.test.js tests/discovery-rail.test.js tests/config.test.js tests/citation-badges.test.js tests/contributor-stats.test.js tests/research-leads.test.js tests/evidence-panel.test.js
```

Expected: PASS (all tests, same count as before this task — this task adds
no new test files or test cases).

Read both modified templates once more: confirm `aiConsent` defaults to
empty string when omitted (via the `{{{aiConsent|}}}` syntax, matching
every other optional field in both templates), and confirm neither
template's visible rendering changed at all — only new `data-*` attributes
were added.

- [ ] **Step 4: Commit**

```bash
git add src/templates/Evidence.wikitext src/templates/ResearchLead.wikitext
git commit -m "feat: add aiConsent field to Evidence and ResearchLead templates"
```

---

### Task 3: Terms of Use — Section 10 (AI Model Training Consent)

**Files:**
- Modify: `src/templates/TermsOfUse.wikitext`

**Interfaces:**
- Consumes: nothing — pure content addition.

- [ ] **Step 1: Append the new section**

In `src/templates/TermsOfUse.wikitext`, replace:

```wikitext
== 9. Contact ==

If you have questions about these Terms of Use, please contact us through
[https://www.tbhfdn.org/contact our contact page].
```

with:

```wikitext
== 9. Contact ==

If you have questions about these Terms of Use, please contact us through
[https://www.tbhfdn.org/contact our contact page].

== 10. AI Model Training Consent ==

Some contributions to this wiki may, in the future, help train an AI
model built specifically on community voice and research — distinct from
the general-purpose corpora most AI models are trained on. This is
separate from the [[Terms of Use#2. Contributing to This Wiki|CC BY-SA
license]] covering general reuse of your contribution.

Setting a `{{Evidence}}` or `{{ResearchLead}}` entry's `aiConsent` field to
"yes" means:

* You agree this specific contribution may be used to train such a model.
* You affirm you have the right to grant this permission on behalf of
  anyone whose voice, account, or story is recorded in it — not only your
  own words. If your contribution is someone else's oral history,
  transcribed by you, this consent should reflect their agreement, not
  only yours.
* You understand that once a model has actually been trained using your
  contribution, withdrawing consent afterward cannot remove that
  contribution's influence from an already-trained model. Consent can
  only be meaningfully withdrawn before any such training has occurred.

Leaving `aiConsent` unset, or set to anything other than "yes", means your
contribution will not be used for this purpose. Your contribution is fully
welcome either way — this consent is entirely separate from your ability
to contribute to and be credited on this wiki.
```

- [ ] **Step 2: Commit**

```bash
git add src/templates/TermsOfUse.wikitext
git commit -m "feat: add Terms of Use section on AI model training consent"
```

---

### Task 4: About page — new "Ultimate Goal" paragraph

**Files:**
- Modify: `src/templates/AboutProject.wikitext`

**Interfaces:**
- Consumes: nothing — pure content addition.

- [ ] **Step 1: Append the new paragraph**

In `src/templates/AboutProject.wikitext`, replace:

```wikitext
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
```

with:

```wikitext
Some leads need more than research time — they need money for an archive
visit, a translator, a dive team, an expert consultation. Every research
lead on this wiki that's tagged as needing funding is already built to
carry a link to a specific fundraising campaign for that exact need. We
intend for those links to eventually connect to Charity Coin, a fundraising
platform we're building to support projects like this one. That connection
doesn't exist yet either — but the moment it does, the path from "we know
this happened, we just can't prove it yet" to "here's exactly how to help
prove it" will be a single click.

Beyond preservation and funding, some of what's gathered here may one day
help train an AI model built specifically on community voice and
research — the kind of model that doesn't yet exist, because the training
data it would need doesn't typically get collected this way. Like the DAO
and Charity Coin connections above, this isn't built yet — contributions
are only ever used this way with the contributor's explicit, separate
consent, never by default. See our [[Terms of Use#10. AI Model Training
Consent|Terms of Use]] for the full explanation.

== How This Compares ==
```

- [ ] **Step 2: Commit**

```bash
git add src/templates/AboutProject.wikitext
git commit -m "feat: mention AI model training as a future direction on the About page"
```

---

### Task 5: Extend the smoke-test checklist

**Files:**
- Modify: `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`

**Interfaces:**
- Consumes: every file produced in Tasks 1-4.

- [ ] **Step 1: Update the checklist**

Append to `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`:

```markdown
## Chain verification and AI-readiness

- [ ] An `{{Evidence}}` entry with `chainStatus=anchored` (plus
      `chainNetwork` and `chainTxHash`) shows the "⛓ On-Chain Verified →"
      badge, and the link resolves to a real-looking block-explorer URL
      (correct the `subscan.io` link format once real anchored data exists
      to test the actual URL pattern against)
- [ ] An `{{Evidence}}` entry with none of the chain fields set renders
      exactly as before this feature — no visible change, no empty badge
- [ ] An `{{Evidence}}` or `{{ResearchLead}}` entry with `aiConsent=yes`
      shows no visible change on the page (the field is intentionally
      inert/stored-only)
- [ ] The About page's new paragraph about AI model training renders
      correctly, and its "Terms of Use" link reaches Section 10
- [ ] The Terms of Use page's new Section 10 renders correctly, including
      all three points (contribution-specific consent, the
      speaking-for-others attestation, and the cannot-undo-after-training
      caveat)

## Before any future AI-training data export (maintainer note, not a
   visitor-facing check)

- [ ] Every `{{Evidence}}`/`{{ResearchLead}}` entry's `type`/need-category,
      `reliability`, citation text, and `aiConsent` value are already
      present as clean `data-*` attributes — confirm this still holds
      before building an export
- [ ] Manually review the category distribution across all
      `aiConsent=yes` entries before training anything. Oral Histories and
      other community-voice categories are the actual point of this
      archive — flag and address any category that's disproportionately
      institutional-record-heavy (Government Records, Land Records, etc.
      are easier to collect in bulk from existing archives than oral
      histories are to gather from community members) before using the
      data to train a model
- [ ] No export script or API endpoint exists yet — confirm this is still
      deliberately out of scope until there's a meaningful volume of
      consented content
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-06-smoke-test-checklist.md
git commit -m "test: extend smoke-test checklist for chain verification and AI-readiness"
```

## Post-plan follow-ups (not part of this plan)

- Actual DAO submission/API integration.
- Actual IPFS pinning.
- An actual data-export script or API endpoint for AI training.
- Any enforced (JS-gated) consent mechanism beyond the documented template
  parameter.
- Correcting the placeholder `subscan.io` link format once real anchored
  data exists to test the actual URL pattern against.
