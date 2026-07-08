const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countDistinctArticles,
  lastActiveDate,
  countCitationTemplateUsages,
  sumCitationCounts,
} = require('../src/contributor-stats.js');

test('countDistinctArticles dedupes by title', () => {
  const contributions = [
    { title: 'Robert Renfro', timestamp: '2026-07-01T12:00:00Z' },
    { title: 'Robert Renfro', timestamp: '2026-06-15T09:00:00Z' },
    { title: 'Fort Nashborough', timestamp: '2026-06-28T09:30:00Z' },
  ];
  assert.equal(countDistinctArticles(contributions), 2);
});

test('countDistinctArticles returns 0 for an empty list', () => {
  assert.equal(countDistinctArticles([]), 0);
});

test('lastActiveDate returns the most recent timestamp regardless of array order', () => {
  const contributions = [
    { title: 'A', timestamp: '2026-06-15T09:00:00Z' },
    { title: 'B', timestamp: '2026-07-01T12:00:00Z' },
    { title: 'C', timestamp: '2026-06-28T09:30:00Z' },
  ];
  assert.equal(lastActiveDate(contributions), '2026-07-01T12:00:00Z');
});

test('lastActiveDate returns null for an empty list', () => {
  assert.equal(lastActiveDate([]), null);
});

test('countCitationTemplateUsages counts {{Citation instances in wikitext', () => {
  const wikitext = '== Sources ==\n{{Citation|title=A|type=book|confidence=verified}}\n{{Citation|title=B|type=archival|confidence=single-source}}';
  assert.equal(countCitationTemplateUsages(wikitext), 2);
});

test('countCitationTemplateUsages returns 0 when there are no citations', () => {
  assert.equal(countCitationTemplateUsages('Just some prose with no sources.'), 0);
});

test('countCitationTemplateUsages is case-insensitive on the template name', () => {
  assert.equal(
    countCitationTemplateUsages('{{citation|title=A|type=book|confidence=verified}}'),
    1
  );
});

test('sumCitationCounts sums an array of per-page counts', () => {
  assert.equal(sumCitationCounts([2, 0, 5, 1]), 8);
});

test('sumCitationCounts returns 0 for an empty array', () => {
  assert.equal(sumCitationCounts([]), 0);
});
