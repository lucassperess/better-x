const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('manifest has minimal permissions and packaged resources exist', () => {
  const m = JSON.parse(read('manifest.json'));
  assert.equal(m.version, JSON.parse(read('package.json')).version);
  assert.equal(m.manifest_version, 3);
  assert.deepEqual(m.permissions, ['storage']);
  assert.deepEqual(m.host_permissions, ['https://x.com/*', 'https://twitter.com/*']);
  for (const file of [m.action.default_popup, ...Object.values(m.icons), ...m.content_scripts.flatMap(s => [...s.js, ...s.css])]) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
  for (const size of [16, 32, 48, 128, 512]) {
    const png = fs.readFileSync(path.join(root, `icons/icon-${size}.png`));
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});

test('popup defaults match content settings', () => {
  const defaults = vm.runInNewContext('(' + read('content.js').match(/const DEFAULTS = (\{[\s\S]*?\});/)[1] + ')');
  const inputs = [...read('popup.html').matchAll(/<input\b[^>]*data-setting="([^"]+)"[^>]*>/g)];
  assert.deepEqual(inputs.map(m => m[1]).sort(), Object.keys(defaults).sort());
  for (const input of inputs) assert.equal(defaults[input[1]], !input[0].includes('data-default="false"'));
});

test('timeline detection excludes post media and carousels', () => {
  const make = (article, media) => ({ dataset: {}, closest: () => article, querySelector: () => media, getBoundingClientRect: () => ({ width: 500, height: 50 }) });
  const header = make(false, false), post = make(true, false), carousel = make(false, true);
  const source = read('content.js').split('  const visibleTimelineTabs = () => {')[1].split('\n  const enableTimelineWheel')[0];
  let candidates = [post, carousel, header];
  const document = { querySelectorAll: s => s.includes('primaryColumn') ? candidates : [post, carousel, header].filter(e => e.dataset.betterXTimelineTabs) };
  const select = vm.runInNewContext('(() => {' + source.trim().replace(/;$/, '') + ')', { document });
  assert.equal(select(), header);
  assert.equal(post.dataset.betterXTimelineTabs, undefined);
  assert.equal(carousel.dataset.betterXTimelineTabs, undefined);
  candidates = [post, carousel];
  assert.equal(select(), null);
  assert.equal(header.dataset.betterXTimelineTabs, undefined);
});
