/* tslint:disable */

export const CHANGELOG: { version: string; html: string; }[] = [
	{
		'version': 'v0.1.0',
		'html': '<p><strong>Engine &amp; Infrastructure</strong></p>\n<ul>\n<li>Upgraded Node.js runtime from v9 to v24 LTS.</li>\n<li><em>Developer Note: Comprehensive overhaul and upgrade of all project libraries to ensure compatibility with Node 24 LTS. Re-validation of environment variables is required.</em></li>\n</ul>\n<p><strong>Features</strong></p>\n<ul>\n<li>Added emoji picker button to the character name editor.</li>\n<li>Integrated TikTok login support.</li>\n<li>Added command suggestions when typing <code>/</code> in chat.</li>\n</ul>\n<p><strong>Gameplay Adjustments</strong></p>\n<ul>\n<li>Grass is no longer destructible by player clicks.</li>\n</ul>\n<p><strong>Authentication Changes</strong></p>\n<ul>\n<li>Removed Twitter and Facebook login options due to API policy changes.</li>\n</ul>\n<p><strong>Maintenance</strong></p>\n<ul>\n<li>General bug fixes and performance improvements.</li>\n</ul>\n'
	},
	{
		'version': 'v0.0.4',
		'html': '<ul>\n<li>Optimized server-side performance.</li>\n<li>Updated application icon.</li>\n<li>General bug fixes.</li>\n</ul>\n'
	},
	{
		'version': 'v0.0.3',
		'html': '<p><strong>Authentication</strong></p>\n<ul>\n<li>Added Login with Twitter, Discord, and GitHub.</li>\n<li>Restricted Google and GitHub providers to &quot;Login Only&quot; (Registration disabled for these methods).</li>\n</ul>\n<p><strong>Server Updates</strong></p>\n<ul>\n<li>Rebranded General Server to &quot;18+ Server&quot;.</li>\n<li>Introduced &quot;Safe Server [PG]&quot;.</li>\n</ul>\n<p><strong>Bug Fixes</strong></p>\n<ul>\n<li>Resolved Chrome Linux graphics issue: <code>Failed to initialize graphics device (Failed to get uniform location(lighting))</code>.</li>\n</ul>\n'
	},
	{
		'version': 'v0.0.2',
		'html': '<p><strong>UI/UX</strong></p>\n<ul>\n<li>Added quick-access buttons for Pony Town and Discord.</li>\n<li>Updated contributor list.</li>\n</ul>\n<p><strong>Map &amp; Assets</strong></p>\n<ul>\n<li>Implemented map revisions.</li>\n<li>Added new environmental assets: Rafflesia flowers, Bakso and Sate carts.</li>\n</ul>\n'
	},
	{
		'version': 'v0.0.1',
		'html': '<ul>\n<li>Initial release.</li>\n</ul>\n'
	}
];
