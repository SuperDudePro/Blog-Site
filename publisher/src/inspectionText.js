export function normalizeComparableText(value) {
  return String(value ?? '')
    .replace(/&rsquo;|&#8217;|&#x2019;/gi, "'")
    .replace(/&lsquo;|&#8216;|&#x2018;/gi, "'")
    .replace(/&ldquo;|&#8220;|&#x201c;/gi, '"')
    .replace(/&rdquo;|&#8221;|&#x201d;/gi, '"')
    .replace(/&mdash;|&#8212;|&#x2014;/gi, '-')
    .replace(/&ndash;|&#8211;|&#x2013;/gi, '-')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function captionMatchesSource(source, caption) {
  const expected = normalizeComparableText(caption);
  if (!expected) return true;
  return normalizeComparableText(source).includes(expected);
}
