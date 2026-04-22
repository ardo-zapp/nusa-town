# Developer Changelog

## v0.2.0
- Refactored `chat-box` UI to support touch-hold and left-click toggling of chat mode/type via `ChatModeId` typing.
- Introduced `typingIndicator` infrastructure via WebSocket (`typingIndicatorMessage`) and visual states (`typingIndicatorDuration`).
- Refactored the commands system (`commands.ts`) to use strongly-typed command categories and enhanced helper listings.
- Improved character preview layout mapping and scale selection (`character.pug`).
- Upgraded the UI buttons implementation using SVG `fa-icons` rather than hardcoded PNG images (`visit-pt-button`, etc).
- Refactored Russian translations natively to English across source files (e.g. system announcements, milestone texts).
- Consolidated legacy SCSS files (e.g. merged `build-box.scss` directly into `app.scss`).

## v0.1.0
- Updated Node 24 support constraints and package configurations.
