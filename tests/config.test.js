// tests/config.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Citizen-preferences.json removes the theme picker', () => {
  const json = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'src', 'Citizen-preferences.json'), 'utf8')
  );
  assert.equal(json.preferences['skin-theme'], null);
});

test('LocalSettings snippet forces the light theme and sets a logo placeholder to fill in', () => {
  const php = fs.readFileSync(
    path.join(__dirname, '..', 'LocalSettings-snippet.php'),
    'utf8'
  );
  assert.match(php, /\$wgCitizenThemeDefault\s*=\s*'light'/);
  assert.match(php, /\$wgLogos\s*=\s*\[/);
});
