const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countDistinctArticles,
  lastActiveDate,
  countEvidenceTemplateUsages,
  sumEvidenceCounts,
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

test('countEvidenceTemplateUsages counts {{Evidence instances in wikitext', () => {
  const wikitext = '== Sources ==\n{{Evidence|title=A|type=Books|reliability=verified}}\n{{Evidence|title=B|type=Primary Documents|reliability=single-source}}';
  assert.equal(countEvidenceTemplateUsages(wikitext), 2);
});

test('countEvidenceTemplateUsages returns 0 when there are no evidence entries', () => {
  assert.equal(countEvidenceTemplateUsages('Just some prose with no sources.'), 0);
});

test('countEvidenceTemplateUsages is case-insensitive on the template name', () => {
  assert.equal(
    countEvidenceTemplateUsages('{{evidence|title=A|type=Books|reliability=verified}}'),
    1
  );
});

test('countEvidenceTemplateUsages counts an entry with whitespace before the first pipe', () => {
  assert.equal(
    countEvidenceTemplateUsages('{{Evidence |title=A|type=Books|reliability=verified}}'),
    1
  );
});

test('sumEvidenceCounts sums an array of per-page counts', () => {
  assert.equal(sumEvidenceCounts([2, 0, 5, 1]), 8);
});

test('sumEvidenceCounts returns 0 for an empty array', () => {
  assert.equal(sumEvidenceCounts([]), 0);
});
