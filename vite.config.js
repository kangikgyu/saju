import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export function getSiteUrl(value) {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL must be a public HTTPS URL without credentials, query, or hash.');
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url;
}

export function seoAssets(siteUrl) {
  const description = '양력·음력 생년월일시로 사주 원국과 오행·십성을 계산하고 신년운세, 사주 궁합, 이직운과 재물에 관한 자기성찰 리포트를 확인할 수 있는 무료 만세력.';
  const website = {
    '@type': 'WebSite',
    name: '결',
    description,
    inLanguage: 'ko-KR',
  };
  const app = {
    '@type': 'WebApplication',
    name: '결 - 무료 사주 만세력',
    description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    featureList: [
      '양력·음력 및 윤달 생년월일 변환',
      '사주 원국과 오행·십성·보조 신살 계산',
      '성향·관계·이직운·재물 자기성찰 리포트',
      '연도별 신년운세와 두 사람의 사주 궁합 비교',
    ],
  };
  if (siteUrl) {
    website['@id'] = `${siteUrl.href}#website`;
    website.url = siteUrl.href;
    app['@id'] = `${siteUrl.href}#webapp`;
    app.url = siteUrl.href;
    app.isPartOf = { '@id': website['@id'] };
  }

  return {
    name: 'site-seo',
    transformIndexHtml() {
      const tags = [{
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        children: JSON.stringify({ '@context': 'https://schema.org', '@graph': [website, app] }),
        injectTo: 'head',
      }];
      if (siteUrl) {
        const imageUrl = new URL('og-image.png', siteUrl).href;
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: siteUrl.href }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: siteUrl.href }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image', content: imageUrl }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image:alt', content: '결 무료 사주 만세력 소개 이미지' }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:image', content: imageUrl }, injectTo: 'head' },
        );
      }
      return tags;
    },
    generateBundle() {
      const sitemapLine = siteUrl ? `Sitemap: ${new URL('sitemap.xml', siteUrl).href}\n` : '';
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${sitemapLine}` });
      if (siteUrl) {
        const location = siteUrl.href.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${location}</loc></url>\n</urlset>\n`,
        });
      }
    },
  };
}

const siteUrl = getSiteUrl(process.env.SITE_URL);

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), seoAssets(siteUrl)],
  optimizeDeps: { noDiscovery: true, include: [] },
});
