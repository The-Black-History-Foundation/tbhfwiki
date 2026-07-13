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
  assert.match(css, /--color-progressive-oklch__h:\s*234\.04/);
  assert.match(css, /--color-progressive-oklch__c:\s*0\.0945/);
  assert.match(css, /--color-progressive-oklch__l:\s*48\.86%/);
});

test('tunes the surface ramp toward clean white backgrounds', () => {
  assert.match(css, /--color-surface-0-oklch__l:\s*100%/);
  assert.match(css, /--color-surface-0-oklch__c:\s*0/);
});

test('defines custom accent properties matching the TBHF brand', () => {
  assert.match(css, /--bhf-color-accent-primary:\s*#006994/i);
  assert.match(css, /--bhf-color-accent-gold:\s*#F2B134/i);
  assert.match(css, /--bhf-color-accent-terracotta:\s*#FF7F50/i);
  assert.match(css, /--bhf-color-success:\s*#2E8B57/i);
});

test('overrides Citizen font-family variables with the TBHF brand fonts', () => {
  assert.match(css, /--font-family-citizen-serif:\s*'TBHF-NeueKabel',\s*Helvetica,\s*Arial,\s*sans-serif/);
  assert.match(css, /--font-family-citizen-base:\s*'TBHF-Helvetica',\s*Helvetica,\s*Arial,\s*sans-serif/);
});

test('defines self-hosted @font-face rules for all five required weights/styles', () => {
  assert.match(
    css,
    /@font-face\s*{\s*font-family:\s*'TBHF-Helvetica';\s*src:\s*url\(\s*'\/wiki\/Special:Redirect\/file\/Helvetica\.ttf'\s*\)[^}]*font-weight:\s*400;\s*font-style:\s*normal;/
  );
  assert.match(
    css,
    /url\(\s*'\/wiki\/Special:Redirect\/file\/Helvetica-Bold\.ttf'\s*\)[^}]*font-weight:\s*700;/
  );
  assert.match(
    css,
    /url\(\s*'\/wiki\/Special:Redirect\/file\/Helvetica-Oblique\.ttf'\s*\)[^}]*font-style:\s*italic;/
  );
  assert.match(
    css,
    /font-family:\s*'TBHF-NeueKabel';\s*src:\s*url\(\s*'\/wiki\/Special:Redirect\/file\/NeueKabel-Book\.otf'\s*\)[^}]*font-weight:\s*400;\s*font-style:\s*normal;/
  );
  assert.match(
    css,
    /url\(\s*'\/wiki\/Special:Redirect\/file\/NeueKabel-Bold\.otf'\s*\)[^}]*font-weight:\s*700;\s*font-style:\s*normal;/
  );
});

test('no longer imports Google Fonts', () => {
  assert.ok(!css.includes('fonts.googleapis.com'));
});

test('uses a flat parchment-free page background treatment', () => {
  assert.match(css, /\.bhf-texture-parchment\s*{[^}]*background-color:\s*var\(\s*--color-surface-0\s*\)/s);
  assert.ok(!css.includes('feTurbulence'), 'paper-grain texture removed for tbhfdn.org brand alignment');
});

test('defines homepage layout classes', () => {
  for (const cls of ['.bhf-masthead', '.bhf-hero-banner', '.bhf-category-strip', '.bhf-category-tile']) {
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

test('contribute prompt uses the primary accent for its border', () => {
  const block = css.match(/\.bhf-contribute-prompt\s*{[^}]*}/s)[0];
  assert.match(block, /border:.*var\(\s*--bhf-color-accent-primary\s*\)/);
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
  assert.match(rootBlock, /--color-surface-0:\s*#FFFFFF/i);
  assert.match(rootBlock, /--color-surface-1:\s*#F5F5F5/i);
  assert.match(rootBlock, /--color-surface-2:\s*#E5E5E5/i);
  assert.match(rootBlock, /--color-base:\s*#0D1B2A/i);
  assert.match(rootBlock, /--color-emphasized:\s*#0D1B2A/i);
  assert.match(rootBlock, /--border-color-base:\s*#E5E5E5/i);
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

test('status badges use the established gold-fill/primary-fill/green-fill contrast pattern', () => {
  const openBlock = css.match(/\.bhf-lead__status--open\s*{[^}]*}/s)[0];
  assert.match(openBlock, /background-color:\s*var\(\s*--bhf-color-accent-gold\s*\)/);
  assert.match(openBlock, /color:\s*var\(\s*--bhf-color-text-on-gold\s*\)/);

  const inProgressBlock = css.match(/\.bhf-lead__status--in-progress\s*{[^}]*}/s)[0];
  assert.match(inProgressBlock, /background-color:\s*var\(\s*--bhf-color-accent-primary\s*\)/);
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

test('defines the masthead logo image class', () => {
  const block = css.match(/\.bhf-masthead__logo\s*{[^}]*}/s)[0];
  assert.match(block, /display:\s*block/);
  assert.match(block, /margin:\s*0\s*auto/);
  assert.match(block, /max-height:\s*80px/);
});

test('defines the legal-notice callout using the primary accent variable, not a hardcoded color', () => {
  const block = css.match(/\.bhf-legal-notice\s*{[^}]*}/s)[0];
  assert.match(block, /border-left:.*var\(\s*--bhf-color-accent-primary\s*\)/);
  assert.match(block, /border:.*var\(\s*--bhf-color-accent-primary\s*\)/);
});

test('defines shared homepage spacing and eyebrow-label tokens', () => {
  assert.match(css, /--bhf-homepage-section-spacing:\s*3rem/);
  assert.match(css, /--bhf-eyebrow-font-size:\s*0\.8rem/);
  assert.match(css, /--bhf-eyebrow-letter-spacing:\s*0\.08em/);
});

test('defines the hero banner with a real MediaWiki search form', () => {
  const block = css.match(/\.bhf-hero-banner\s*{[^}]*}/s)[0];
  assert.match(block, /display:\s*flex/);

  assert.match(css, /\.bhf-hero-banner__eyebrow\s*{[^}]*font-size:\s*var\(\s*--bhf-eyebrow-font-size\s*\)/s);
  assert.match(css, /\.bhf-hero-banner__search \.searchbox\s*{[^}]*}/s);
});

test('the hero banner uses the InputBox extension, not a raw HTML form MediaWiki would escape', () => {
  const mainPage = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'templates', 'MainPage.wikitext'),
    'utf8'
  );
  // MediaWiki's Sanitizer does not allow raw <form>/<input>/<button> tags in
  // wikitext -- it HTML-escapes them into visible, non-functional text
  // instead of rendering a working form. Confirmed on a live test wiki.
  assert.ok(!mainPage.includes('<form '), 'must not use a raw <form> tag');
  assert.match(mainPage, /<inputbox>\s*type=fulltext/);
});

test('defines the mission band with a distinct surface from the parchment page background', () => {
  const block = css.match(/\.bhf-mission-band\s*{[^}]*}/s)[0];
  assert.match(block, /background-color:\s*var\(\s*--color-surface-2\s*\)/);
  assert.match(block, /margin-block:\s*var\(\s*--bhf-homepage-section-spacing\s*\)/);
});

test('discovery rail section headings use the shared eyebrow treatment', () => {
  const block = css.match(/\.bhf-rail__column h2\s*{[^}]*}/s)[0];
  assert.match(block, /font-size:\s*var\(\s*--bhf-eyebrow-font-size\s*\)/);
  assert.match(block, /letter-spacing:\s*var\(\s*--bhf-eyebrow-letter-spacing\s*\)/);
});

test('discovery rail cards render as a responsive grid with a gold-bordered shell', () => {
  const cardsBlock = css.match(/\.bhf-rail__cards\s*{[^}]*}/s)[0];
  assert.match(cardsBlock, /display:\s*grid/);

  const cardBlock = css.match(/\.bhf-rail-card\s*{[^}]*}/s)[0];
  assert.match(cardBlock, /border:.*var\(\s*--bhf-color-accent-gold\s*\)/);
});

test('category tiles have a real interactive hover/focus state and room for an icon', () => {
  const block = css.match(/\.bhf-category-tile\s*{[^}]*}/s)[0];
  assert.match(block, /padding:\s*1\.5rem/);

  const hoverBlock = css.match(/\.bhf-category-tile:hover,?\s*\.bhf-category-tile:focus\s*{[^}]*}/s)[0];
  assert.match(hoverBlock, /transform:/);

  assert.match(css, /\.bhf-category-tile__icon\s*{[^}]*}/s);
});

test('category tile icons are a plain <span> styled via CSS data URIs, not inline <svg> or external image files', () => {
  const mainPage = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'templates', 'MainPage.wikitext'),
    'utf8'
  );
  // MediaWiki's Sanitizer does not allow raw <svg> in wikitext content
  // either (same root cause as the hero search form issue) -- it
  // HTML-escapes <svg>...</svg> into visible, broken text instead of
  // rendering it. Confirmed on a live test wiki.
  assert.ok(!mainPage.includes('<svg'), 'must not use a raw <svg> tag');
  assert.match(mainPage, /<span class="bhf-category-tile__icon"><\/span>/);
  assert.ok(!mainPage.includes('[[File:People-icon'));

  for (const modifier of ['--people', '--places', '--events', '--eras']) {
    assert.match(css, new RegExp(`\\.bhf-category-tile${modifier} \\.bhf-category-tile__icon\\s*{[^}]*background-image:\\s*url\\(`));
  }
});
