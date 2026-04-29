Our Old Dad post updates overlay

Unzip this at the root of the Blog-Site repo.

It updates:
- src/content/postTypes.ts
  - removes Starter from PostStatus, leaving Featured | Recent
- src/content/posts/advice-1-dont-be-a-dick/
  - status: Recent
- src/content/posts/the-wrong-ruler/
  - status: Recent
- src/content/posts/running-away-running-true/
  - status: Recent
  - corrected hero/card image selection
  - includes the cropped purple signpost image as an inline image

Important cleanup:
- If this folder exists from the bad package, delete it:
  src/content/posts/running-away-running-true-v2/
