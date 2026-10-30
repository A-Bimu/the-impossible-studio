// Guard the static navigation on each calendar's A4 print page.
// These pages are nested three levels below the Studio homepage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const editions = ['roots-2027', 'atlas-africa-2027', 'heritage-africa-2027'];
const destinations = [
  ['THE IMPOSSIBLE STUDIO.', '../../../', ''],
  ['Back to the edition', '../', ''],
  ['All calendars', '../../', ''],
  ['Work gallery', '../../../#work', 'work'],
  ['Main gallery', '../../../#work', 'work'],
];

for (const edition of editions) {
  test(edition + ': print-page navigation resolves to the intended page', async () => {
    const page = new URL('calendars/' + edition + '/print/index.html', root);
    const html = await readFile(page, 'utf8');
    const anchors = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .map((match) => ({
        href: match[1],
        label: match[2].replace(/<[^>]*>/g, '').replace(/&#\d+;/g, '').trim(),
      }));

    for (const [label, expectedHref, section] of destinations) {
      const anchor = anchors.find((item) => item.label.includes(label));
      assert.ok(anchor, edition + ': missing navigation label ' + label);
      assert.equal(anchor.href, expectedHref, edition + ': incorrect destination for ' + label);

      const target = new URL(anchor.href, page);
      const expected = new URL(expectedHref, page);
      assert.equal(target.pathname, expected.pathname);
      if (section) {
        assert.equal(target.hash, '#' + section);
        assert.match(homepage, new RegExp('id=["\x27]' + section + '["\x27]'));
      }
      const file = new URL(target.href);
      file.hash = '';
      file.search = '';
      if (file.pathname.endsWith('/')) file.pathname += 'index.html';
      await access(file);
    }
    assert.doesNotMatch(html, /href="(?:\.\.\/)+#archive"/,
      edition + ': legacy archive anchor must not be used');
  });
}
