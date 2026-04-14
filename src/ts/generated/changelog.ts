/* tslint:disable */

export const CHANGELOG: { version: string; changes: string[]; }[] = [
  {
    "version": "v0.1.0",
    "changes": [
      "**Engine & Infrastructure**\n  - Upgraded Node.js runtime from v9 to v24 LTS.\n  - *Developer Note: Comprehensive overhaul and upgrade of all project libraries to ensure compatibility with Node 24 LTS. Re-validation of environment variables is required.*",
      "**Features**\n  - Added emoji picker button to the character name editor.\n  - Integrated TikTok login support.\n  - Added command suggestions when typing `/` in chat.",
      "**Gameplay Adjustments**\n  - Grass is no longer destructible by player clicks.",
      "**Authentication Changes**\n  - Removed Twitter and Facebook login options due to API policy changes.",
      "**Maintenance**\n  - General bug fixes and performance improvements."
    ]
  },
  {
    "version": "v0.0.4",
    "changes": [
      "Optimized server-side performance.",
      "Updated application icon.",
      "General bug fixes."
    ]
  },
  {
    "version": "v0.0.3",
    "changes": [
      "**Authentication**\n  - Added Login with Twitter, Discord, and GitHub.\n  - Restricted Google and GitHub providers to \"Login Only\" (Registration disabled for these methods).",
      "**Server Updates**\n  - Rebranded General Server to \"18+ Server\".\n  - Introduced \"Safe Server [PG]\".",
      "**Bug Fixes**\n  - Resolved Chrome Linux graphics issue: `Failed to initialize graphics device (Failed to get uniform location(lighting))`."
    ]
  },
  {
    "version": "v0.0.2",
    "changes": [
      "**UI/UX**\n  - Added quick-access buttons for Pony Town and Discord.\n  - Updated contributor list.",
      "**Map & Assets**\n  - Implemented map revisions.\n  - Added new environmental assets: Rafflesia flowers, Bakso and Sate carts."
    ]
  },
  {
    "version": "v0.0.1",
    "changes": [
      "Initial release."
    ]
  }
];
