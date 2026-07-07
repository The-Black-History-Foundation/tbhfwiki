const test = require('node:test');
const assert = require('node:assert/strict');
const { transformRecentChanges, renderCard, transformMostViewed, isPageViewInfoUnavailable } = require('../src/discovery-rail.js');

test('transformRecentChanges maps the core API shape to card data', () => {
  const apiResponse = {
    query: {
      recentchanges: [
        { title: 'Robert Renfro', timestamp: '2026-07-01T12:00:00Z', user: 'TKennedy' },
        { title: 'Fort Nashborough', timestamp: '2026-06-28T09:30:00Z', user: 'Contributor2' },
      ],
    },
  };

  const result = transformRecentChanges(apiResponse);

  assert.deepEqual(result, [
    {
      title: 'Robert Renfro',
      timestamp: '2026-07-01T12:00:00Z',
      user: 'TKennedy',
      url: '/wiki/Robert_Renfro',
    },
    {
      title: 'Fort Nashborough',
      timestamp: '2026-06-28T09:30:00Z',
      user: 'Contributor2',
      url: '/wiki/Fort_Nashborough',
    },
  ]);
});

test('transformRecentChanges returns an empty array when the API response has no results', () => {
  assert.deepEqual(transformRecentChanges({ query: { recentchanges: [] } }), []);
});

test('renderCard produces a card with title, contributor, and relative-safe timestamp', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
  });

  assert.match(html, /class="bhf-rail-card"/);
  assert.match(html, /href="\/wiki\/Robert_Renfro"/);
  assert.match(html, />Robert Renfro</);
  assert.match(html, /TKennedy/);
});

test('renderCard escapes HTML in titles and usernames to prevent injection', () => {
  const html = renderCard({
    title: '<script>alert(1)</script>',
    timestamp: '2026-07-01T12:00:00Z',
    user: '<b>x</b>',
    url: '/wiki/Test',
  });

  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>x</b>'));
});

test('transformMostViewed maps the PageViewInfo API shape to card data', () => {
  const apiResponse = {
    query: {
      mostviewed: [
        { title: 'Robert Renfro', count: 482 },
        { title: 'Fort Nashborough', count: 210 },
      ],
    },
  };

  assert.deepEqual(transformMostViewed(apiResponse), [
    { title: 'Robert Renfro', views: 482, url: '/wiki/Robert_Renfro' },
    { title: 'Fort Nashborough', views: 210, url: '/wiki/Fort_Nashborough' },
  ]);
});

test('transformMostViewed returns null when the mostviewed list is absent (extension not installed)', () => {
  assert.equal(transformMostViewed({ query: {} }), null);
});

test('isPageViewInfoUnavailable detects the unknown_action API error', () => {
  assert.equal(
    isPageViewInfoUnavailable({ error: { code: 'unknown_action' } }),
    true
  );
  assert.equal(
    isPageViewInfoUnavailable({ error: { code: 'some_other_error' } }),
    false
  );
  assert.equal(isPageViewInfoUnavailable({ query: {} }), false);
});
