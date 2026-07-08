// tests/citizen-theme.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'citizen-theme.css'),
  'utf8'
);

test('defines the brand hue/chroma/lightness on :root', () => {
  assert.match(css, /--color-progressive-oklch__h:\s*56\.01/);
  assert.match(css, /--color-progressive-oklch__c:\s*0\.0614/);
  assert.match(css, /--color-progressive-oklch__l:\s*38\.28%/);
});

test('tunes the surface ramp toward warm parchment', () => {
  assert.match(css, /--color-surface-0-oklch__l:\s*94\.8%/);
  assert.match(css, /--color-surface-0-oklch__c:\s*0\.018/);
});

test('defines custom accent properties not covered by Citizen tokens', () => {
  assert.match(css, /--bhf-color-accent-gold:\s*#B8863B/i);
  assert.match(css, /--bhf-color-accent-terracotta:\s*#A8482F/i);
  assert.match(css, /--bhf-color-success:\s*#3B5C40/i);
});

test('overrides Citizen font-family variables with the archival type system', () => {
  assert.match(css, /--font-family-citizen-serif:\s*'Source Serif 4',\s*'Source-Serif-fallback'/);
  assert.match(css, /--font-family-citizen-base:\s*'Source Sans 3',\s*'Source-Sans-fallback'/);
});

test('imports the chosen Google Fonts with a full weight range', () => {
  assert.match(css, /fonts\.googleapis\.com\/css2\?family=Source\+Serif\+4/);
  assert.match(css, /fonts\.googleapis\.com\/css2\?family=Source\+Sans\+3/);
});

test('ships a metric-matched fallback face to avoid font-flicker layout shift', () => {
  assert.match(css, /@font-face\s*{\s*font-family:\s*'Source-Sans-fallback'/);
  assert.match(css, /@font-face\s*{\s*font-family:\s*'Source-Serif-fallback'/);
});

test('gates the paper-grain texture behind performance-mode-off', () => {
  assert.match(
    css,
    /\.citizen-feature-performance-mode-clientpref-0\s+\.bhf-texture-parchment/
  );
});

test('paper-grain texture is a low-opacity SVG noise background', () => {
  assert.match(css, /\.bhf-texture-parchment\s*{[^}]*background-image:\s*url\(/s);
});

test('defines homepage layout classes', () => {
  for (const cls of ['.bhf-masthead', '.bhf-hero', '.bhf-category-strip', '.bhf-category-tile']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('category tiles use the gold-filled-chip contrast pattern, not gold text', () => {
  const tileBlock = css.match(/\.bhf-category-tile\s*{[^}]*}/s)[0];
  assert.match(tileBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(tileBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);
});

test('defines the shared infobox shell and per-type variants', () => {
  for (const cls of ['.bhf-infobox', '.bhf-infobox--person', '.bhf-infobox--place', '.bhf-infobox--event']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('pull-quote uses gold left-border with italic serif text', () => {
  const block = css.match(/\.bhf-pullquote\s*{[^}]*}/s)[0];
  assert.match(block, /border-left:.*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(block, /font-style:\s*italic/);
  assert.match(block, /font-family:\s*var\(\s*--font-family-citizen-serif\s*\)/);
});

test('verified badge uses gold-fill contrast pattern, and success badge uses the green token', () => {
  const badgeBlock = css.match(/\.bhf-badge--verified\s*{[^}]*}/s)[0];
  assert.match(badgeBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(badgeBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);
});

test('defines the breadcrumb category tags and related-pages sidebar block', () => {
  for (const cls of ['.bhf-breadcrumb', '.bhf-related-pages']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('defines the homepage community footer band and article contribute prompt', () => {
  for (const cls of ['.bhf-footer-band', '.bhf-contribute-prompt']) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('contribute prompt uses the terracotta accent, not gold, for its border', () => {
  const block = css.match(/\.bhf-contribute-prompt\s*{[^}]*}/s)[0];
  assert.match(block, /border:.*var\(\s*--bhf-color-accent-terracotta\s*\)/);
});

test('defines discovery rail layout and card classes', () => {
  for (const cls of [
    '.bhf-rail',
    '.bhf-rail__column',
    '.bhf-rail__cards',
    '.bhf-rail-card',
    '.bhf-rail-card__title',
    '.bhf-rail-card__meta',
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('discovery rail stacks into a single column on narrow viewports', () => {
  const mediaBlock = css.match(
    /@media \( max-width: 640px \)\s*{\s*\.bhf-rail\s*{[^}]*}/s
  );
  assert.ok(mediaBlock, 'expected a max-width: 640px media query targeting .bhf-rail');
  assert.match(mediaBlock[0], /flex-direction:\s*column/);
});

test('article headings render in the archival serif type system', () => {
  const block = css.match(/#firstHeading,\s*\.mw-heading\s*{[^}]*}/s);
  assert.ok(block, 'expected #firstHeading and .mw-heading to share a rule block');
  assert.match(
    block[0],
    /font-family:\s*var\(\s*--font-family-citizen-serif\s*\)/
  );
});

test('sets direct hex overrides for surface/base/border tokens to survive a future Citizen token-pipeline upgrade', () => {
  const rootBlock = css.match(/:root\s*{[^}]*}/s)[0];
  assert.match(rootBlock, /--color-surface-0:\s*#F4EDE1/i);
  assert.match(rootBlock, /--color-surface-1:\s*#FBF7EF/i);
  assert.match(rootBlock, /--color-surface-2:\s*#F3ECDD/i);
  assert.match(rootBlock, /--color-base:\s*#2A1D14/i);
  assert.match(rootBlock, /--color-emphasized:\s*#2A1D14/i);
  assert.match(rootBlock, /--border-color-base:\s*#D9CBB4/i);
});

test('defines the pull-quote attribution styling', () => {
  assert.ok(css.includes('.bhf-pullquote__attribution'));
});

test('defines the citation card shell and all six type variants', () => {
  for (const cls of [
    '.bhf-citation', '.bhf-citation--archival', '.bhf-citation--newspaper',
    '.bhf-citation--book', '.bhf-citation--oral-history', '.bhf-citation--record',
    '.bhf-citation--photo'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('citation type variants set a distinct label via ::before content', () => {
  assert.match(css, /\.bhf-citation--archival \.bhf-citation__type::before\s*{\s*content:\s*"Archival Document"/);
  assert.match(css, /\.bhf-citation--oral-history \.bhf-citation__type::before\s*{\s*content:\s*"Oral History"/);
});

test('confidence tags use the established palette tokens, not new colors', () => {
  const verifiedBlock = css.match(/\.bhf-citation__confidence--verified\s*{[^}]*}/s)[0];
  assert.match(verifiedBlock, /color:\s*var\(\s*--bhf-color-success\s*\)/);

  const singleSourceBlock = css.match(/\.bhf-citation__confidence--single-source\s*{[^}]*}/s)[0];
  assert.match(singleSourceBlock, /color:\s*var\(\s*--color-subtle\s*\)/);

  const disputedBlock = css.match(/\.bhf-citation__confidence--disputed\s*{[^}]*}/s)[0];
  assert.match(disputedBlock, /color:\s*var\(\s*--bhf-color-accent-terracotta\s*\)/);
});

test('defines the green reviewer-confirmed badge using established tokens', () => {
  const block = css.match(/\.bhf-badge--reviewed\s*{[^}]*}/s)[0];
  assert.match(block, /background-color:\s*var\(\s*--bhf-color-success\s*\)/);
  assert.match(block, /color:\s*var\(\s*--color-surface-0\s*\)/);
});

test('defines the contributor profile card shell and its sub-components', () => {
  for (const cls of [
    '.bhf-profile', '.bhf-profile__bio', '.bhf-profile__tags',
    '.bhf-profile__tag', '.bhf-profile-stats', '.bhf-profile__featured',
    '.bhf-profile__featured-label'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('profile tags use established border/text tokens, not new colors', () => {
  const block = css.match(/\.bhf-profile__tag\s*{[^}]*}/s)[0];
  assert.match(block, /color:\s*var\(\s*--color-subtle\s*\)/);
  assert.match(block, /border:.*var\(\s*--border-color-base\s*\)/);
});

test('defines the lead card shell, need-tag variants, and status badge variants', () => {
  for (const cls of [
    '.bhf-lead', '.bhf-lead__summary', '.bhf-lead__known', '.bhf-lead__needs',
    '.bhf-lead__need-tag',
    '.bhf-lead__need-tag--archival', '.bhf-lead__need-tag--translation',
    '.bhf-lead__need-tag--fieldwork', '.bhf-lead__need-tag--funding',
    '.bhf-lead__need-tag--expertise', '.bhf-lead__need-tag--digitization',
    '.bhf-lead__status',
    '.bhf-lead__status--open', '.bhf-lead__status--in-progress', '.bhf-lead__status--resolved',
    '.bhf-lead__discuss'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('need-tag variants set a distinct label via ::before content', () => {
  assert.match(css, /\.bhf-lead__need-tag--archival::before\s*{\s*content:\s*"Archival Access"/);
  assert.match(css, /\.bhf-lead__need-tag--digitization::before\s*{\s*content:\s*"Digitization"/);
});

test('status badges use the established gold-fill/terracotta-fill/green-fill contrast pattern', () => {
  const openBlock = css.match(/\.bhf-lead__status--open\s*{[^}]*}/s)[0];
  assert.match(openBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(openBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);

  const inProgressBlock = css.match(/\.bhf-lead__status--in-progress\s*{[^}]*}/s)[0];
  assert.match(inProgressBlock, /background-color:\s*var\(\s*--bhf-color-accent-terracotta\s*\)/);
  assert.match(inProgressBlock, /color:\s*var\(\s*--color-surface-0\s*\)/);

  const resolvedBlock = css.match(/\.bhf-lead__status--resolved\s*{[^}]*}/s)[0];
  assert.match(resolvedBlock, /background-color:\s*var\(\s*--bhf-color-success\s*\)/);
  assert.match(resolvedBlock, /color:\s*var\(\s*--color-surface-0\s*\)/);
});

test('defines the leads board group layout and lead-card classes', () => {
  for (const cls of [
    '.bhf-leads-group', '.bhf-leads-group__cards', '.bhf-lead-card',
    '.bhf-lead-card__title', '.bhf-lead-card__excerpt'
  ]) {
    assert.ok(css.includes(cls), `expected ${cls} to be defined`);
  }
});

test('the lead card is a single anchor with no nested link (unlike the discovery rail card)', () => {
  const block = css.match(/\.bhf-lead-card\s*{[^}]*}/s)[0];
  assert.match(block, /text-decoration:\s*none/);
});
