const OOD_SITEMAP = 'https://ourolddad.com/post/';

export function includeOurOldDadPostInSitemap(xml, { slug, publishedAt, canonicalUrl }) {
  if (typeof xml !== 'string' || !xml.includes('</urlset>')) {
    throw new Error('Our Old Dad committed sitemap is missing or malformed.');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    throw new Error('Cannot update sitemap without a valid post slug and published date.');
  }
  const expected = `${OOD_SITEMAP}${slug}`;
  if (canonicalUrl !== expected) throw new Error('Sitemap canonical URL disagrees with Our Old Dad post route.');
  const escaped = expected.replace(/&/g, '&amp;');
  const route = `<loc>${escaped}</loc>`;
  if (xml.includes(route)) return { content: xml, changed: false };
  const entry = `  <url>\n    ${route}\n    <lastmod>${publishedAt}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  const updated = xml.replace('</urlset>', `${entry}</urlset>`);
  return { content: updated, changed: true };
}
