#### v0.2.0

**Features**
  - Added typing indicator in chat.
  - Added the ability to change chat type by holding the chat tag or clicking it (LMB).
  - Added support for up to three chat bubbles simultaneously.
  - Added UI toggle in the game world (F6 key).
  - Added the ability to change the direction your character is looking by double-clicking on the screen or using the Numpad keys (1, 2, 3, 4, 6, 7, 8, 9).

**UI/UX**
  - Redesigned and updated character list.
  - Replaced image-based external link buttons with crisp SVG icons.
  - Added player coordinates to the performance/stats text.
  - Relocated the performance/stats text to the top-center of the screen.
  - Revamped the "Build Box" interface to use a compact, clean toggle button.
  - Upgraded Account Settings UI to include Account ID (with copy functionality), Account Creation Date, and Total Playtime.

**Commands**
  - Grouped commands into categories for cleaner `/help` display.
  - Added `/accountid`, `/accountdate`, `/playtime`, `/age`, `/collections`, and `/achievements`.
  - Added moderator commands: `/speed`, `/locations`, `/players`, `/maps`.
  - Updated `/time` to support setting specific frozen times or unfreezing.
  - Updated `/tp` to allow teleporting to specific players or teleporting them to you.

**Editor**
  - Added background locking feature to the character preview.
  - Added new character state visualizations.

#### v0.1.0

**Engine & Infrastructure**
  - Upgraded Node.js runtime from v9 to v24 LTS.
  - *Developer Note: Comprehensive overhaul and upgrade of all project libraries to ensure compatibility with Node 24 LTS. Re-validation of environment variables is required.*

**Features**
  - Added emoji picker button to the character name editor.
  - Integrated TikTok login support.
  - Added command suggestions when typing `/` in chat.

**Gameplay Adjustments**
  - Grass is no longer destructible by player clicks.

**Authentication Changes**
  - Removed Twitter and Facebook login options due to API policy changes.

**Maintenance**
  - General bug fixes and performance improvements.

#### v0.0.4

- Optimized server-side performance.
- Updated application icon.
- General bug fixes.

#### v0.0.3

**Authentication**
  - Added Login with Twitter, Discord, and GitHub.
  - Restricted Google and GitHub providers to "Login Only" (Registration disabled for these methods).

**Server Updates**
  - Rebranded General Server to "18+ Server".
  - Introduced "Safe Server [PG]".

**Bug Fixes**
  - Resolved Chrome Linux graphics issue: `Failed to initialize graphics device (Failed to get uniform location(lighting))`.

#### v0.0.2

**UI/UX**
  - Added quick-access buttons for Pony Town and Discord.
  - Updated contributor list.

**Map & Assets**
  - Implemented map revisions.
  - Added new environmental assets: Rafflesia flowers, Bakso and Sate carts.

#### v0.0.1

- Initial release.
