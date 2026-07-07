const test = require('node:test');
const assert = require('node:assert/strict');
const { transformRecentChanges, renderCard } = require('../src/discovery-rail.js');

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
