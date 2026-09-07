const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const { measureEntryGraph, stripHash } = require('./bundle-size-gate.cjs');

const writeDist = (files) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'entry-graph-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return root;
};

test('walks static imports only and skips dynamic import()', () => {
  const root = writeDist({
    'index.html':
      '<script type="module" crossorigin src="/_spa/assets/index-AAAAAAAA.js"></script>',
    'assets/index-AAAAAAAA.js':
      'import{a}from"./sync-BBBBBBBB.js";import"../vendor/vendor-react-CCCCCCCC.js";const x=()=>import("./lazy-DDDDDDDD.js");export*from"./reexport-EEEEEEEE.js";',
    'assets/sync-BBBBBBBB.js': 'import{b}from"./sync-BBBBBBBB.js";export const a=1;',
    'assets/reexport-EEEEEEEE.js': 'export const r=1;',
    'assets/lazy-DDDDDDDD.js': 'export const lazy=1;',
    'vendor/vendor-react-CCCCCCCC.js': 'export const react=1;',
  });

  const graph = measureEntryGraph(root);

  assert.equal(graph.entry, 'assets/index-AAAAAAAA.js');
  assert.equal(graph.count, 4);
  assert.deepEqual(graph.chunks, {
    'assets/index.js': 1,
    'assets/reexport.js': 1,
    'assets/sync.js': 1,
    'vendor/vendor-react.js': 1,
  });
  assert.ok(graph.gz > 0);
});

test('stripHash removes the trailing rolldown hash including hashes starting with a dash', () => {
  assert.equal(
    stripHash('i18n/i18n-ja-JP-ui-runtime--Jre4geO.js'),
    'i18n/i18n-ja-JP-ui-runtime.js',
  );
  assert.equal(stripHash('assets/es-DBDe-NCK.js'), 'assets/es.js');
  assert.equal(stripHash('assets/index-CDFWou5k.js'), 'assets/index.js');
});

const { spawnSync } = require('node:child_process');

const runCheck = ({ baselineCount, currentCount, maxChunks }) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'size-gate-'));
  const graph = (count) => ({
    chunks: Object.fromEntries(
      Array.from({ length: count }, (_, i) => [`assets/chunk-${i}.js`, 1]),
    ),
    count,
    entry: 'assets/index.js',
    gz: count,
  });
  const write = (name, count) =>
    fs.writeFileSync(
      path.join(root, name),
      JSON.stringify({
        graphs: { 'dist/desktop': graph(count) },
        sizes: { 'dist/desktop': count },
      }),
    );
  write('baseline.json', baselineCount);
  write('current.json', currentCount);

  return spawnSync(
    process.execPath,
    [
      path.join(__dirname, 'bundle-size-gate.cjs'),
      'check',
      '--current',
      path.join(root, 'current.json'),
      '--baseline',
      path.join(root, 'baseline.json'),
      '--max-chunks',
      String(maxChunks),
    ],
    { encoding: 'utf8' },
  );
};

test('chunk count over the fixed ceiling fails the gate', () => {
  const result = runCheck({ baselineCount: 3, currentCount: 5, maxChunks: 4 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /more than 4 chunks/);
});

test('new chunk names alone do not fail the gate while under the ceiling', () => {
  const result = runCheck({ baselineCount: 1, currentCount: 4, maxChunks: 4 });
  assert.equal(result.status, 0);
});
