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
