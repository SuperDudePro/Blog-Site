export const TREE_FAVICON = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="LifeEducation">
  <rect width="64" height="64" rx="14" fill="#08130f"/>
  <path d="M32 9c-7.7 9.2-13.5 18-17.4 26.3C11.1 42.8 16.3 51 24.4 51H30v6h4v-6h5.6c8.1 0 13.3-8.2 9.8-15.7C45.5 27 39.7 18.2 32 9Z" fill="#177B58"/>
  <path d="M32 17v34M23 36l9 8 9-8M25 27l7 7 7-7" fill="none" stroke="#d9f5e8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/why", label: "Why" },
  { href: "/floor", label: "Floor" },
  { href: "/by-18", label: "By 18" },
  { href: "/domains", label: "Domains" },
  { href: "/posts", label: "Posts" },
  { href: "/qa", label: "Q&A" },
] as const;
