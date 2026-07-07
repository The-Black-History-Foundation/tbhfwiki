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
