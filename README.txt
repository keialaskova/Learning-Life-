Learning Life — Tasks, Notes & Goals update

This package contains an updated index.html for the existing Learning Life repository.
It redesigns the Tasks, Notes, and Goals pages for Theme 7 (Bubu & Dudu Beach) only.

Install:
1. Keep a backup of your current index.html.
2. Replace the repository's index.html with this file (rename it to index.html).
3. Do not delete your existing redesign.css, redesign-v30.css, bubu-theme.js, bubu-stickers.js,
   assets/, or other existing project files.
4. Commit and push to the same GitHub Pages repository.
5. Refresh the site after GitHub Pages finishes publishing.

Data:
- Existing tasks and goals are retained in their existing localStorage keys.
- Existing plain-text Notes are migrated into a Personal note when the new Notes page loads.
- New Notes use the additional myday_notesEntries key.
- Task due dates are stored with each task.

Scope:
- Only the Bubu & Dudu Theme 7 page styling is changed.
- Other six themes are not targeted by the new page styles.
- This is a source update; it has passed JavaScript syntax validation but has not been browser-tested
  or deployed to GitHub Pages from this chat.
