Our Old Dad batch 01 - folder-based post system

What changed
- Posts now load automatically from src/content/posts/*/index.ts
- Each post lives in its own folder with its images and content
- The home page, section pages, and post pages all update from those folders
- Hash routes now support #/post/<slug>

One-time install
1. Replace your current src folder with the src folder in this batch.
2. Deploy.

After that, future publishing is simple:
1. Drop a new post folder into src/content/posts/
2. Deploy on Vercel

Current example post
- src/content/posts/journey-40-songs-and-a-time-machine/

Minimum structure for a future post folder
- your-slug/
  - index.ts
  - hero.jpg (optional)
  - any inline images used by the post

The index.ts file should export one default post object matching the pattern in the Journey example.
