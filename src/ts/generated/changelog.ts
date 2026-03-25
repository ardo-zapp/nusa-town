/* tslint:disable */

export const CHANGELOG: { version: string; changes: string[]; }[] = [
  {
    "version": "v0.1.0",
    "changes": [
      "**Engine & Infrastructure**",
      "Upgraded Node.js runtime from v9 to v24 LTS.",
      "*Developer Note: Comprehensive overhaul and upgrade of all project libraries to ensure compatibility with Node 24 LTS. Re-validation of environment variables is required.*",
      "**Features**",
      "Added emoji picker button to the character name editor.",
      "Integrated TikTok login support.",
      "Added command suggestions when typing `/` in chat.",
      "**Gameplay Adjustments**",
      "Grass is no longer destructible by player clicks.",
      "**Authentication Changes**",
      "Removed Twitter and Facebook login options due to API policy changes.",
      "**Maintenance**",
      "General bug fixes and performance improvements."
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
      "**Authentication**",
      "Added Login with Twitter, Discord, and GitHub.",
      "Restricted Google and GitHub providers to \"Login Only\" (Registration disabled for these methods).",
      "**Server Updates**",
      "Rebranded General Server to \"18+ Server\".",
      "Introduced \"Safe Server [PG]\".",
      "**Bug Fixes**",
      "Resolved Chrome Linux graphics issue: `Failed to initialize graphics device (Failed to get uniform location(lighting))`."
    ]
  },
  {
    "version": "v0.0.2",
    "changes": [
      "**UI/UX**",
      "Added quick-access buttons for Pony Town and Discord.",
      "Updated contributor list.",
      "**Map & Assets**",
      "Implemented map revisions.",
      "Added new environmental assets: Rafflesia flowers, Bakso and Sate carts."
    ]
  },
  {
    "version": "v0.0.1",
    "changes": [
      "Initial release."
    ]
  }
];
