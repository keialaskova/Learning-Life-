Learning Life visual correction

- Replaced the two small dashboard character MP4s with animated WebP files that have transparent backgrounds. The white character areas are preserved; only the edge-connected white canvas is removed.
- Reduced the cooking video card to 80% of the dashboard content width. The full square video frame is shown using object-fit: contain.
- The cooking video itself remains a normal video and is not background-keyed.

Upload the full contents of this ZIP to the repository, replacing existing files. Then hard-refresh the site or clear the site's cached data if an older service-worker cache is still active.
