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
      userUrl: '/wiki/User%3ATKennedy',
    },
    {
      title: 'Fort Nashborough',
      timestamp: '2026-06-28T09:30:00Z',
      user: 'Contributor2',
      url: '/wiki/Fort_Nashborough',
      userUrl: '/wiki/User%3AContributor2',
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

test('renderCard includes the timestamp when present', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
  });

  assert.match(html, /TKennedy &middot; 2026-07-01T12:00:00Z/);
});

test('renderCard omits the timestamp separator when timestamp is absent (Trending use case)', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    user: '482 views',
    url: '/wiki/Robert_Renfro',
  });

  assert.match(html, /class="bhf-rail-card__meta">482 views<\/span>/);
  assert.ok(!html.includes('&middot;'));
  assert.ok(!html.includes('bhf-rail-card__user-link'));
});

test('renderCard links the contributor name to their profile when userUrl is present', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
    userUrl: '/wiki/User%3ATKennedy',
  });

  assert.match(html, /<a class="bhf-rail-card__user-link" href="\/wiki\/User%3ATKennedy">TKennedy<\/a>/);
  assert.match(html, /<div class="bhf-rail-card">/);
  assert.match(html, /<a class="bhf-rail-card__title" href="\/wiki\/Robert_Renfro">Robert Renfro<\/a>/);
});

test('renderCard does not produce nested anchors', () => {
  const html = renderCard({
    title: 'Robert Renfro',
    timestamp: '2026-07-01T12:00:00Z',
    user: 'TKennedy',
    url: '/wiki/Robert_Renfro',
    userUrl: '/wiki/User%3ATKennedy',
  });

  // The card wrapper must be a <div>, never an <a> — otherwise the
  // .bhf-rail-card__title and .bhf-rail-card__user-link anchors inside it
  // would be invalid nested <a> tags.
  assert.ok(!/^<a class="bhf-rail-card"/.test(html));
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
