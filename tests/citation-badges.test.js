// tests/citation-badges.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { countCitations, hasReviewedCategory } = require('../src/citation-badges.js');

test('countCitations returns the number of citation elements', () => {
  assert.equal(countCitations([{}, {}, {}]), 3);
});

test('countCitations returns 0 for an empty list', () => {
  assert.equal(countCitations([]), 0);
});

test('hasReviewedCategory returns true when a title contains Category:Reviewed', () => {
  assert.equal(
    hasReviewedCategory(['Category:People', 'Category:Reviewed']),
    true
  );
});

test('hasReviewedCategory returns false when no title matches', () => {
  assert.equal(
    hasReviewedCategory(['Category:People', 'Category:Places']),
    false
  );
});

test('hasReviewedCategory returns false for an empty list', () => {
  assert.equal(hasReviewedCategory([]), false);
});

const { buildBadgeHtml } = require('../src/citation-badges.js');

test('buildBadgeHtml returns both badges when sourced and reviewed', () => {
  const html = buildBadgeHtml({ hasSources: true, isReviewed: true });
  assert.match(html, /bhf-badge--verified/);
  assert.match(html, /bhf-badge--reviewed/);
});

test('buildBadgeHtml returns only the gold badge when sourced but not reviewed', () => {
  const html = buildBadgeHtml({ hasSources: true, isReviewed: false });
  assert.match(html, /bhf-badge--verified/);
  assert.doesNotMatch(html, /bhf-badge--reviewed/);
});

test('buildBadgeHtml returns only the green badge when reviewed but not sourced', () => {
  const html = buildBadgeHtml({ hasSources: false, isReviewed: true });
  assert.doesNotMatch(html, /bhf-badge--verified/);
  assert.match(html, /bhf-badge--reviewed/);
});

test('buildBadgeHtml returns an empty string when neither applies', () => {
  assert.equal(buildBadgeHtml({ hasSources: false, isReviewed: false }), '');
});
