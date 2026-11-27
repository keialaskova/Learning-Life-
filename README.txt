LEARNING LIFE — COMPLETE STARTER BUILD 3

This build combines the three screens in the requested order:
1. Loading screen with Learning Life title, beach artwork, Bubu & Dudu sticker, and animated progress bar.
2. Welcome/name screen. The name is saved in this browser using localStorage.
3. Dashboard with the cooking video and the two supplied animated bear MP4s in the header and greeting positions.

The first visit shows Loading -> Welcome -> Dashboard after the user enters a name. Later visits show Loading -> Dashboard using the saved name. Clearing this site's browser data resets the welcome step.

Both character animations and the cooking video are configured for muted autoplay, looping and inline mobile playback. Mobile browsers may restrict autoplay in some situations; videos remain available for user playback.

This is a front-end prototype. Calendar, Money and More navigation destinations, full task management, and cloud synchronization are not implemented yet.

To publish on GitHub Pages: upload the CONTENTS of this folder to the repository root, preserving the assets folder structure.
