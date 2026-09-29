import test from 'node:test';
import assert from 'node:assert/strict';
import { getSiteUrl, seoAssets } from '../vite.config.js';

function emittedAssets(plugin) {
  const files = new Map();
  plugin.generateBundle.call({ emitFile(file) { files.set(file.fileName, file.source); } });
  return files;
}

test('public site URL keeps the project path and rejects non-public forms', () => {
  assert.equal(getSiteUrl('https://example.com/saju').href, 'https://example.com/saju/');
  assert.throws(() => getSiteUrl('http://example.com/'), /HTTPS/);
  assert.throws(() => getSiteUrl('https://example.com/?page=1'), /HTTPS/);
});

test('metadata, sitemap and robots share one canonical URL', () => {
  const siteUrl = getSiteUrl('https://example.com/saju/');
  const plugin = seoAssets(siteUrl);
  const tags = plugin.transformIndexHtml();
  const canonical = tags.find((tag) => tag.attrs?.rel === 'canonical');
  const graph = JSON.parse(tags.find((tag) => tag.attrs?.type === 'application/ld+json').children);
  const files = emittedAssets(plugin);
  assert.equal(canonical.attrs.href, siteUrl.href);
  assert.equal(graph['@graph'][1].url, siteUrl.href);
  assert.match(files.get('sitemap.xml'), /<loc>https:\/\/example\.com\/saju\/<\/loc>/);
  assert.match(files.get('robots.txt'), /Sitemap: https:\/\/example\.com\/saju\/sitemap\.xml/);
  assert.equal(tags.find((tag) => tag.attrs?.property === 'og:image').attrs.content, 'https://example.com/saju/og-image.png');
});

test('unknown deployment URL creates no false canonical or sitemap', () => {
  const plugin = seoAssets(null);
  const tags = plugin.transformIndexHtml();
  const files = emittedAssets(plugin);
  assert.equal(tags.some((tag) => tag.attrs?.rel === 'canonical'), false);
  assert.equal(files.has('sitemap.xml'), false);
  assert.equal(files.get('robots.txt'), 'User-agent: *\nAllow: /\n');
});
