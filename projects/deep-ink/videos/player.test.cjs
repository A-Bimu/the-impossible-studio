'use strict';

// Run from the repository root: node --test projects/deep-ink/videos/player.test.cjs
// Synthetic bytes only. This does not validate the approved MP4 archives or browser playback.
const test = require('node:test');
const assert = require('node:assert/strict');
const player = require('./player.js');

test('zero-indexed archive paths match the 13- and 8-part markup contracts', () => {
  assert.equal(player.partUrl('/media/concept-01.mp4.b64/', 0), '/media/concept-01.mp4.b64/part-00.txt');
  assert.equal(player.partUrl('/media/concept-01.mp4.b64', 12), '/media/concept-01.mp4.b64/part-12.txt');
  assert.equal(player.partUrl('/media/concept-02.mp4.b64', 7), '/media/concept-02.mp4.b64/part-07.txt');
});

test('reassembles chunks split mid-base64 in index order despite out-of-order responses', async () => {
  const original = Buffer.from('Deep Ink archive: preserve exact original bytes!\u0000\u00ff', 'latin1');
  const encoded = original.toString('base64');
  const pieces = [encoded.slice(0, 5), encoded.slice(5, 17), encoded.slice(17)];
  const pending = [];
  const progress = [];
  const promise = player.reassemble({
    src: '/archive',
    parts: 3,
    load(url) {
      return new Promise(resolve => pending.push({ url, resolve }));
    },
    onProgress(done, total) { progress.push([done, total]); }
  });
  assert.deepEqual(pending.map(p => p.url), [
    '/archive/part-00.txt', '/archive/part-01.txt', '/archive/part-02.txt'
  ]);
  for (const index of [2, 0, 1]) {
    pending[index].resolve({ ok: true, text: async () => ' \n' + pieces[index] + '\n' });
  }
  const restored = await promise;
  assert.deepEqual(Buffer.from(restored), original);
  assert.deepEqual(progress, [[1, 3], [2, 3], [3, 3]]);
});

test('rejects an unavailable archive part instead of silently returning truncated media', async () => {
  await assert.rejects(
    player.reassemble({
      src: '/archive',
      parts: 2,
      load: async url => url.endsWith('part-01.txt')
        ? { ok: false, status: 404 }
        : { ok: true, text: async () => 'YWJj' }
    }),
    /Archived part 1 returned 404/
  );
});

test('rejects missing configuration before fetching', async () => {
  await assert.rejects(player.reassemble({ parts: 1, load: async () => {} }), /Missing data-src/);
  await assert.rejects(player.reassemble({ src: '/archive', parts: 0, load: async () => {} }), /Missing data-src/);
});
