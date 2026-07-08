const test = require('node:test');
const assert = require('node:assert/strict');
const {
  NEED_TYPES,
  titleToUrl,
  escapeHtml,
  groupLeadsByNeed,
  renderLeadCard,
} = require('../src/research-leads.js');

test('titleToUrl converts spaces to underscores and percent-encodes special characters', () => {
  assert.equal(titleToUrl('Lead: Hidden burial ground'), '/wiki/Lead%3A_Hidden_burial_ground');
});

test('groupLeadsByNeed filters each need category down to open leads only', () => {
  const openTitles = ['Lead: A', 'Lead: B'];
  const needMemberships = {
    archival: ['Lead: A', 'Lead: C'],
    translation: [],
    fieldwork: ['Lead: B'],
    funding: [],
    expertise: [],
    digitization: [],
  };

  const result = groupLeadsByNeed(openTitles, needMemberships);

  assert.deepEqual(result.archival, ['Lead: A']);
  assert.deepEqual(result.fieldwork, ['Lead: B']);
  assert.deepEqual(result.translation, []);
});

test('groupLeadsByNeed returns all six need types even when memberships omit some', () => {
  const result = groupLeadsByNeed([], {});
  for (const needType of NEED_TYPES) {
    assert.deepEqual(result[needType], []);
  }
});

test('groupLeadsByNeed excludes a lead from every group once it is no longer open', () => {
  const openTitles = ['Lead: A'];
  const needMemberships = {
    archival: ['Lead: B'],
    translation: [],
    fieldwork: [],
    funding: [],
    expertise: [],
    digitization: [],
  };

  const result = groupLeadsByNeed(openTitles, needMemberships);

  assert.deepEqual(result.archival, []);
});

test('renderLeadCard includes title, excerpt, and link', () => {
  const html = renderLeadCard({
    title: 'Lead: Hidden burial ground near Union Street',
    url: '/wiki/Lead%3A_Hidden_burial_ground_near_Union_Street',
    extract: 'Community oral histories describe a burial ground beneath the lot.',
  });

  assert.match(html, /class="bhf-lead-card"/);
  assert.match(html, /href="\/wiki\/Lead%3A_Hidden_burial_ground_near_Union_Street"/);
  assert.match(html, />Lead: Hidden burial ground near Union Street</);
  assert.match(html, /Community oral histories describe a burial ground beneath the lot\./);
});

test('renderLeadCard omits the excerpt span when extract is empty', () => {
  const html = renderLeadCard({
    title: 'Lead: X',
    url: '/wiki/Lead%3A_X',
    extract: '',
  });

  assert.ok(!html.includes('bhf-lead-card__excerpt'));
});

test('renderLeadCard escapes HTML in title and extract to prevent injection', () => {
  const html = renderLeadCard({
    title: '<script>alert(1)</script>',
    url: '/wiki/Test',
    extract: '<b>x</b>',
  });

  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>x</b>'));
});
