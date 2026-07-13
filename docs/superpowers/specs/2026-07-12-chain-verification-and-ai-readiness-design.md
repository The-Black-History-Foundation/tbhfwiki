# Blockchain Verification & AI-Readiness — Design

**Date:** 2026-07-12
**Author:** Theresa Kennedy (The Black History Foundation, tbhfdn.org)
**Status:** Approved for planning

## Purpose

Two related but distinct extensions to the wiki's data model, requested
together: (1) fields on `{{Evidence}}` so a source can eventually be
submitted to and anchored on Black History DAO's Polkadot-based chain, and
(2) an explicit, separate consent mechanism so contributions can
eventually help train an AI model built on community voice — plus the
public-facing disclosure that both of these are stated future
intentions, matching the existing treatment of the DAO/Charity Coin
mentions on the About page.

This project adds fields and documentation only. No actual blockchain
submission, no actual AI training or data export happens here — both
integrations remain narrative/inert, the same posture already established
for Black History DAO and Charity Coin elsewhere in this project.

## Grounding: The Real Black History DAO Data Model

Evaluated the live demo at `bh-dao.vercel.app` directly (its `/submit`
form and homepage) rather than guessing at fields. Findings:

- **Submission form fields:** Title, Description, Type (image/audio/video/
  document — a *file format*, not a history category), Source URL,
  Language, License, Tags (freeform), File Upload.
- **On-chain terminology:** "IPFS CID", "Chain proof" (shown as network +
  hash together, e.g. `Paseo tx 0x8b…42f`), "On-chain proof",
  "DAO verified".
- **Workflow:** submission → 7-day community vote → threshold reached →
  expert review → approval triggers IPFS pinning + on-chain anchoring,
  tracked via a proposal ID.
- **Status shown:** Approved · Pending · Flagged — this is the DAO's own
  internal moderation status, distinct from whether IPFS pinning/anchoring
  has actually happened (which follows automatically once approved).

**Key mismatch resolved:** the DAO's own "Type" field is a file format
(image/audio/video/document), completely different from our `type` field
(Government Records, Oral Histories, etc.). When evidence is eventually
submitted to the DAO, our `type` value becomes one of *their* freeform
`Tags`, not their `Type` field — each system keeps using its own type
field for what it's actually for.

## Scope

- 5 new optional fields on `src/templates/Evidence.wikitext`: `chainStatus`,
  `daoProposalId`, `ipfsCid`, `chainNetwork`, `chainTxHash`,
  `chainVerifiedDate` — plus a visible "On-Chain Verified" badge when
  `chainStatus=anchored`.
- 1 new optional field (`aiConsent=yes|no`) on both
  `src/templates/Evidence.wikitext` and `src/templates/ResearchLead.wikitext`
  — the two templates carrying real community-contributed historical
  content. (`ContributorProfile.wikitext` is about the contributor, not
  historical material, so out of scope.)
- New CSS for the on-chain badge, reusing the existing brand palette.
- A new section on `src/templates/TermsOfUse.wikitext` covering the
  `aiConsent` field, including the three considerations below.
- A new paragraph on `src/templates/AboutProject.wikitext`'s "Our Ultimate
  Goal" section, alongside the existing DAO/Charity Coin paragraphs.
- Documentation only for data-readiness: no export script, no bias-audit
  tooling — a maintainer-facing note on what a future export needs, and a
  manual pre-export review process, both added to
  `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md`.
- Out of scope, explicitly: any actual DAO submission/API integration; any
  actual IPFS pinning; any actual AI training or data export mechanism; any
  enforced (JS-gated) consent UI — `aiConsent` is a template parameter with
  clear documentation, the same honor-system precedent already used for
  reliability self-attestation; any change to `reliability`'s own 3 values.

## Scope Decisions

**`type` → DAO `Tags` mapping, not DAO `Type`:** confirmed above — avoids
conflating a history-category taxonomy with a file-format taxonomy.

**Chain network and tx hash as separate fields:** the DAO's UI shows them
together ("Paseo tx 0x8b…42f"), but keeping `chainNetwork` and
`chainTxHash` as two fields (rather than one combined string) means we can
format links correctly and aren't stuck if the DAO migrates off the Paseo
testnet to Polkadot mainnet later.

**One `chainStatus` field, not a mirror of the DAO's full moderation
pipeline:** the DAO's own Approved/Pending/Flagged status lives on their
side; our wiki only needs to track whether *this specific piece of
evidence* has been submitted for anchoring yet (`none` → `pending` →
`anchored`), not replicate their entire internal review state.

**Visible badge when anchored:** this is the actual payoff of the feature
— readers should be able to see and click through to real on-chain proof,
not just have it stored invisibly (unlike the still-fully-inert `scanUrl`
field, which has no real digital-scan feature built yet to display).

**Consent is a template parameter, not an enforced UI gate:** MediaWiki
templates render output; they don't gate the editing/saving process. A
true enforced checkbox would require new save-hook JS — real, new
architecture disproportionate to what a documented, honor-system field
(the same posture as reliability self-attestation) already provides.

**No export tooling in this project:** building the actual export
mechanism is real backend work with no visitor-facing benefit, and there's
no meaningful volume of `aiConsent=yes` content yet to export. This project
only ensures the data is structured and ready.

**Bias auditing is a documented manual process, not tooling:** same
reasoning — no real corpus to audit yet.

## Three Considerations Surfaced During Design (folded in per direct instruction)

1. **Consent cannot be fully undone once a model is trained.** Someone can
   set `aiConsent=no` later, but if an export/training run already
   happened using their contribution, there is no practical way to remove
   its influence from an already-trained model's weights. The Terms of Use
   must state this plainly — consent here is only reversible *before* an
   export happens, not after.
2. **The contributor isn't necessarily the story's subject.** Whoever adds
   a `{{Evidence}}` or `{{ResearchLead}}` entry checks `aiConsent`, but
   that isn't the same as consent from whoever the account is actually
   about or from (e.g. a family member's oral history, transcribed by
   someone else). The Terms of Use needs an attestation clause: setting
   `aiConsent=yes` affirms the contributor has the right to grant that
   permission on behalf of anyone whose voice or account is recorded, not
   only their own words.
3. **Disputed evidence and chain-anchoring.** Nothing technically prevents
   setting `chainStatus` on a `reliability=disputed` entry, but the point
   of on-chain verification is to mean something stronger than "it's in
   our wiki." A documentation note (not an enforced restriction) states
   that anchoring is intended for verified/single-source evidence.

## `Evidence.wikitext` — Field & Badge Additions

New optional fields, added to the existing usage comment and `data-*`
attributes:

```wikitext
<!-- New optional fields, in addition to the existing set:
    chainStatus (none|pending|anchored — default: none, i.e. omitted),
    daoProposalId (links to the DAO's own proposal/vote record),
    ipfsCid (matches the DAO's own "IPFS CID" terminology),
    chainNetwork (e.g. "Paseo" today, or a mainnet name later),
    chainTxHash (the on-chain transaction hash),
    chainVerifiedDate (when anchoring completed — distinct from this
    entry's own historical `date` field).
    aiConsent (yes|no — default: no, i.e. omitted or any value other than
    "yes" — see Template:Evidence's own page for the full consent
    explanation, matching Terms of Use section 10). -->
```

The wrapper `<div>` gains matching `data-evidence-chain-status`,
`data-evidence-dao-proposal-id`, `data-evidence-ipfs-cid`,
`data-evidence-chain-network`, `data-evidence-chain-tx-hash`,
`data-evidence-chain-verified-date`, and `data-evidence-ai-consent`
attributes, following the exact same dual attribute-plus-visible-text
pattern the existing fields already use.

A new conditional block renders the badge only when
`chainStatus=anchored`:

```wikitext
{{#ifeq:{{{chainStatus|}}}|anchored|<a class="bhf-evidence-entry__chain-badge" href="https://{{{chainNetwork}}}.subscan.io/extrinsic/{{{chainTxHash}}}">⛓ On-Chain Verified →</a>|}}
```

(The `subscan.io` link format is Polkadot ecosystem's standard block
explorer pattern — `{network}.subscan.io/extrinsic/{txHash}` — a
reasonable placeholder given the DAO demo doesn't expose its own explorer
URL format yet; this can be corrected once real anchored data exists to
test against, per the manual smoke-test note below.)

## `ResearchLead.wikitext` — Consent Field Addition

Adds the same `aiConsent=yes|no` optional parameter, documented the same
way, with a matching `data-lead-ai-consent` attribute on the wrapper
`<div>`. No visible rendering change — this field is inert/stored only,
matching `campaignUrl`'s existing precedent on this same template.

## CSS

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

Reuses `--bhf-color-accent-primary` (the brand's Ocean Blue) rather than
`--bhf-color-success` (already used for `reliability=verified`) — chain
verification is a distinct, additional claim from editorial reliability,
and should read as visually distinct, not a duplicate of the same green.

## Terms of Use — New Section 10

```wikitext
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

## About Page — New "Ultimate Goal" Paragraph

```wikitext
Beyond preservation and funding, some of what's gathered here may one day
help train an AI model built specifically on community voice and
research — the kind of model that doesn't yet exist, because the training
data it would need doesn't typically get collected this way. Like the DAO
and Charity Coin connections above, this isn't built yet — contributions
are only ever used this way with the contributor's explicit, separate
consent, never by default. See our [[Terms of Use#10. AI Model Training
Consent|Terms of Use]] for the full explanation.
```

(Placed as a fourth paragraph, after the existing Charity Coin paragraph.)

## Data-Readiness Documentation (No Tooling)

Added to `docs/superpowers/plans/2026-07-06-smoke-test-checklist.md` as a
new maintainer-facing section (not a visitor-facing checklist item):

```markdown
## Before any future AI-training data export (maintainer note, not a
   visitor-facing check)

- Every `{{Evidence}}`/`{{ResearchLead}}` entry's `type`/need-category,
  `reliability`, citation text, and `aiConsent` value are already present
  as clean `data-*` attributes — confirm this still holds before building
  an export.
- Manually review the category distribution across all `aiConsent=yes`
  entries before training anything. Oral Histories and other
  community-voice categories are the actual point of this archive — flag
  and address any category that's disproportionately institutional-
  record-heavy (Government Records, Land Records, etc. are easier to
  collect in bulk from existing archives than oral histories are to
  gather from community members) before using the data to train a model.
- No export script or API endpoint exists yet — this is deliberately out
  of scope until there's a meaningful volume of consented content.
```

## Testing Plan

- `tests/citizen-theme.test.js` additions: `.bhf-evidence-entry__chain-badge`
  is defined, uses `var(--bhf-color-accent-primary)` (not
  `--bhf-color-success`, to keep it visually distinct from the reliability
  badge).
- `tests/evidence-panel.test.js`: not directly affected — the chain badge
  and `aiConsent` are rendered by the wikitext template directly (via
  `{{#if}}`/`{{#ifeq}}`), not by `evidence-panel.js`'s JS grouping/rendering
  functions, so no pure-function changes are needed here. (The panel's
  JS-side grouping still works on `.bhf-evidence-entry` elements exactly as
  before — these new fields ride along as additional attributes it simply
  doesn't read, same as how it already ignores `citation`'s absence
  gracefully.)
- Manual smoke-test checklist additions: an entry with
  `chainStatus=anchored` shows the "On-Chain Verified" badge and the link
  resolves to a real-looking block-explorer URL; an entry with no chain
  fields renders exactly as before (no regression, no visible change); an
  entry with `aiConsent=yes` shows no visible change (the field is
  intentionally inert/stored-only, matching `campaignUrl`'s precedent); the
  About page's new paragraph and the Terms of Use's new Section 10 render
  correctly with working links.

## Open Items for Future Phases (explicitly out of scope here)

- Actual DAO submission/API integration (no code here submits anything to
  `bh-dao.vercel.app`).
- Actual IPFS pinning.
- An actual data-export script or API endpoint for AI training.
- Any enforced (JS-gated) consent mechanism beyond a documented template
  parameter.
- Correcting the placeholder `subscan.io` link format once real anchored
  data exists to test the actual URL pattern against.
