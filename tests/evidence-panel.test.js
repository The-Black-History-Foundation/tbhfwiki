const test = require('node:test');
const assert = require('node:assert/strict');
const {
  EVIDENCE_HIERARCHY,
  countEvidenceEntries,
  groupEvidenceByCategory,
  renderEvidencePanel
} = require('../src/evidence-panel.js');

test('EVIDENCE_HIERARCHY defines Primary Documents as parent of exactly 5 children', () => {
  const primaryDocs = EVIDENCE_HIERARCHY.find((def) => def.category === 'Primary Documents');
  assert.deepEqual(primaryDocs.children, ['Government Records', 'Land Records', 'Military Records', 'Maps', 'Letters']);
});

test('countEvidenceEntries returns the number of entries', () => {
  assert.equal(countEvidenceEntries([{}, {}, {}]), 3);
  assert.equal(countEvidenceEntries([]), 0);
});

test('groupEvidenceByCategory buckets a child category under Primary Documents as a subgroup', () => {
  const entries = [
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].category, 'Primary Documents');
  assert.equal(groups[0].entries.length, 0);
  assert.equal(groups[0].subgroups.length, 1);
  assert.equal(groups[0].subgroups[0].category, 'Government Records');
  assert.equal(groups[0].subgroups[0].entries.length, 1);
});

test('groupEvidenceByCategory keeps entries directly typed Primary Documents separate from its children', () => {
  const entries = [
    { title: 'Catch-all doc', type: 'Primary Documents', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.equal(groups[0].entries.length, 1);
  assert.equal(groups[0].entries[0].title, 'Catch-all doc');
  assert.equal(groups[0].subgroups[0].entries[0].title, 'Deed');
});

test('groupEvidenceByCategory omits empty categories and never adds a subgroups key to standalone categories', () => {
  const entries = [
    { title: 'A newspaper clipping', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].category, 'Newspapers');
  assert.equal(groups[0].subgroups, undefined);
});

test('groupEvidenceByCategory produces the fixed display order regardless of input order', () => {
  const entries = [
    { title: 'A', type: 'Archaeology', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'B', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'C', type: 'Land Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ];
  const groups = groupEvidenceByCategory(entries);
  assert.deepEqual(groups.map((g) => g.category), ['Primary Documents', 'Newspapers', 'Archaeology']);
});

test('renderEvidencePanel produces a native <details>/<summary> panel with the total count', () => {
  const groups = groupEvidenceByCategory([
    { title: 'Deed', type: 'Government Records', date: '1779', repository: 'County Archive', reliability: 'verified', citation: 'Smith, J. (1830).' }
  ]);
  const html = renderEvidencePanel(groups, 1);
  assert.match(html, /^<details class="bhf-evidence-panel">/);
  assert.match(html, /<summary class="bhf-evidence-panel__summary">Evidence \(1 source\)<\/summary>/);
  assert.match(html, /<\/details>$/);
});

test('renderEvidencePanel uses plural "sources" for counts other than 1', () => {
  const groups = groupEvidenceByCategory([
    { title: 'A', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'B', type: 'Newspapers', date: '', repository: '', reliability: 'verified', citation: '' }
  ]);
  const html = renderEvidencePanel(groups, 2);
  assert.match(html, /Evidence \(2 sources\)/);
});

test('renderEvidencePanel shows a subcategory heading nested under its parent category heading', () => {
  const groups = groupEvidenceByCategory([
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' }
  ]);
  const html = renderEvidencePanel(groups, 1);
  assert.match(html, /<div class="bhf-evidence-panel__category">Primary Documents \(1\)<\/div>/);
  assert.match(html, /<div class="bhf-evidence-panel__subcategory">Government Records \(1\)<\/div>/);
});

test('renderEvidencePanel counts a Primary Documents heading using direct entries plus all its children combined', () => {
  const groups = groupEvidenceByCategory([
    { title: 'Catch-all', type: 'Primary Documents', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'Deed', type: 'Government Records', date: '', repository: '', reliability: 'verified', citation: '' },
    { title: 'Map', type: 'Maps', date: '', repository: '', reliability: 'verified', citation: '' }
  ]);
  const html = renderEvidencePanel(groups, 3);
  assert.match(html, /<div class="bhf-evidence-panel__category">Primary Documents \(3\)<\/div>/);
});

test('renderEvidencePanel HTML-escapes every field to prevent injection', () => {
  const groups = groupEvidenceByCategory([
    {
      title: '<script>alert(1)</script>',
      type: 'Newspapers',
      date: '"><img src=x>',
      repository: '<b>bold</b>',
      reliability: 'verified',
      citation: '<i>italic</i>'
    }
  ]);
  const html = renderEvidencePanel(groups, 1);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x>'));
  assert.ok(!html.includes('<b>bold</b>'));
  assert.ok(!html.includes('<i>italic</i>'));
});
