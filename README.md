# Learning Life — Bubu & Dudu Beach theme (first build)

This is the first visual-theme build based on the supplied mobile reference screenshots and the Working Life 2.0 starter project.

- Bubu & Dudu Beach is the default theme.
- The six existing themes remain available in Settings.
- Mobile navigation is presented as a four-item bottom bar (Home, Calendar, Money, Settings).
- Existing starter planner forms and local browser storage remain in place.
- The supplied 54 Bubu & Dudu sticker PNGs are included in `assets/stickers/`.

This is a visual-theme foundation, not a claim that every screen in the reference mockups is fully implemented. Features such as wallet management, richer note folders, goal completion controls, and the video need their own functional implementation in a later pass.

## Publish
Upload the contents of this folder to the root of your GitHub Pages repository. Keep your existing repository backup until the new version has been tested.


## Welcome artwork reliability fix (v3)
The welcome artwork is embedded directly in `index.html` as a data URI. This avoids GitHub Pages asset-path, folder-upload, and filename-case issues for the welcome image. Other project assets remain in `assets/` unchanged.
