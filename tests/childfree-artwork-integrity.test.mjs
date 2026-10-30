import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const html = readFileSync(new URL('../work/childfree/index.html', import.meta.url), 'utf8');
const approvedSheet = new URL('../assets/childfree-original.webp', import.meta.url);
const expectedApprovedGitBlob = '9ed3ae8e82bb58bc3f2d7c6dc6f7fa1a80255bd1';

function assertWebP(bytes, name) {
  assert.ok(bytes.length > 1024, name + ' is unexpectedly small');
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', name + ' is not a RIFF file');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', name + ' is not WebP artwork');
}

test('approved source sheet is byte-for-byte identical to the archived main-branch artwork', () => {
  const bytes = readFileSync(approvedSheet);
  assertWebP(bytes, 'approved concept sheet');
  const gitBlob = createHash('sha1')
    .update(Buffer.from('blob ' + bytes.length + '\0'))
    .update(bytes)
    .digest('hex');
  assert.equal(gitBlob, expectedApprovedGitBlob, 'approved artwork changed; review before accepting');
  assert.match(html, /src="\.\.\/\.\.\/assets\/childfree-original\.webp"/);
});

test('nine individual pin previews are present, distinct, and described accessibly', () => {
  const cards = [...html.matchAll(/<article class="pin-card" data-mood="(whimsical|chilled|bold)">([\s\S]*?)<\/article>/g)];
  assert.equal(cards.length, 9, 'the canonical collection must contain nine pins');
  const moods = {whimsical: 0, chilled: 0, bold: 0};
  const uniquePreviews = new Set();

  cards.forEach(([_, mood, body], i) => {
    moods[mood]++;
    const image = body.match(/<img\b[^>]*\bsrc="(pins\/pin-\d{2}\.webp)"[^>]*>/);
    assert.ok(image, 'pin ' + (i + 1) + ' must link to its own artwork crop');
    assert.equal(image[1], 'pins/pin-' + String(i + 1).padStart(2, '0') + '.webp');
    assert.match(image[0], /\balt="[^"]{20,}"/, 'pin ' + (i + 1) + ' needs descriptive alt text');
    assert.match(body, /<h3>[^<]+<\/h3>/, 'pin ' + (i + 1) + ' needs a title');
    assert.match(body, /class="pin-open"/, 'pin ' + (i + 1) + ' needs a detail control');

    const bytes = readFileSync(new URL('../work/childfree/' + image[1], import.meta.url));
    assertWebP(bytes, image[1]);
    uniquePreviews.add(createHash('sha256').update(bytes).digest('hex'));
  });

  assert.deepEqual(moods, {whimsical: 3, chilled: 3, bold: 3});
  assert.equal(uniquePreviews.size, 9, 'each pin should have its own distinct artwork crop');
});
