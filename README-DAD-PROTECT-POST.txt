# Dad, Do You Love Me Enough to Protect Me? - Post Package

Target site: Our Old Dad
Destination path: src/content/posts/dad-do-you-love-me-enough-to-protect-me/
Post URL after deploy: https://www.ourolddad.com/post/dad-do-you-love-me-enough-to-protect-me
Slug: dad-do-you-love-me-enough-to-protect-me
Title: Dad, Do You Love Me Enough to Protect Me?
Published date: 2026-05-01
Status: Recent
Section: diary

## Image Placement

- top-billboard-crop.png: top/card/hero image.
- inline-acme-billboard.png: first body image, placed after the Acme sales-pitch setup.
- inline-school-crosswalk.png: second body image, placed after the privacy/growing-up section.

## Copy This Folder

Copy:

src/content/posts/dad-do-you-love-me-enough-to-protect-me/

To:

Blog-Site/src/content/posts/dad-do-you-love-me-enough-to-protect-me/

Do not copy public/sitemap.xml by hand. Run npm run build from the Blog-Site root and the sitemap will be regenerated from the post folders.

## Build Check

From the Blog-Site root:

npm install
npm run build

Confirm:
- top/card image appears,
- both body images appear,
- post appears in Diary and Everything,
- date sorting is correct,
- sitemap includes the post URL.
