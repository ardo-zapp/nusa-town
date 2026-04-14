export interface Credit {
		name: string;
		title: string;
		avatarImage: string;
		links: string[];
}

export interface Contributor {
		name: string;
		links?: string[];
}

export interface Contributors {
		group: string;
		contributors: Contributor[];
}

// The Team
export const CREDITS: Credit[] = [
		{
		name: 'Ardo Zapp',
		title: 'Owner / Lead Developer',
		avatarImage: 'ardo-zapp.webp',
		links: ['https://www.facebook.com/ardo.zapp', 'https://github.com/ardo-zapp'],
		},
		{
		name: 'Rinonmac',
		title: 'Programmer',
		avatarImage: 'rinonmac.webp',
		links: ['https://github.com/rinonmac'],
		},
		{
		name: 'Land Burner',
		title: 'Artist / Admin',
		avatarImage: 'land-burner.webp',
		links: ['https://www.facebook.com/ikkrifik'],
		},
		{
		name: 'OhZuya',
		title: 'Artist / Admin',
		avatarImage: 'ohzuya.webp',
		links: ['https://www.facebook.com/ohzuya.gaming.5'],
		},
		{
		name: 'Kimmy Alina',
		title: 'Artist',
		avatarImage: 'kimmy-alina.webp',
		links: ['https://www.instagram.com/k1mmyal1na/'],
		},
		{
		name: 'Diane',
		title: 'Artist',
		avatarImage: 'diane.webp',
		links: ['https://facebook.com/dex.vortex'],
		},
		{
		name: 'Shozo Fox',
		title: 'Moderator',
		avatarImage: 'shozo-fox.webp',
		links: ['https://www.tiktok.com/@shozo_fox', 'https://www.instagram.com/shozofox'],
		},
		{
		name: 'Papercliff',
		title: 'Moderator',
		avatarImage: 'papercliff.webp',
		links: ['https://x.com/Papercliff_PT'],
		},
		{
		name: 'Zalfa Oriana',
		title: 'Moderator',
		avatarImage: 'zalfa-oriana.webp',
		links: ['https://facebook.com/zalfa.oriana.1', 'https://youtube.com/c/ZalfaOriana'],
		}
		];

export const CONTRIBUTORS: Contributors[] = [
		{
		group: 'Music Composers',
		contributors: [
		{ name: 'Wandering Artist', links: ['https://wanderingartist.bandcamp.com/', 'https://www.youtube.com/user/WanderingArtistMusic'] },
		],
		},
		{
		group: 'Programmers',
		contributors: [
		{ name: 'Industrialice' },
		{ name: 'Thorn Rose', links: ['https://github.com/Thorn-Rose'] },
		],
		},
		{
		group: 'Artists',
		contributors: [
		{ name: 'Shino', links: ['https://www.deviantart.com/shinodage'] },
		{ name: 'ChiraChan', links: ['https://www.deviantart.com/chiramii-chan', 'https://chirachan-art.tumblr.com/'] },
		{ name: 'Goodly', links: ['https://www.deviantart.com/goodlyay'] },
		{ name: 'TioRafaJP', links: ['https://www.deviantart.com/tiorafajp', 'https://www.youtube.com/user/RafaelJP2'] },
		{ name: 'ShareMyShipment', links: ['https://www.deviantart.com/sharemyshipment'] },
		{ name: 'Velenor' },
		{ name: 'Meno', links: ['https://twitter.com/menojar', 'https://www.deviantart.com/menojar'] },
		{ name: 'OtakuAP', links: ['https://www.deviantart.com/otakuap'] },
		{ name: 'Disastral' },
		{ name: 'CyberPon3', links: ['https://twitter.com/CyberPon3'] },
		{ name: 'Paulpeoples', links: ['https://www.deviantart.com/paulpeopless'] },
		{ name: 'Velvet-Frost', links: ['https://www.deviantart.com/velvet-frost'] },
		{ name: 'Jet7Wave', links: ['https://www.deviantart.com/jetwave'] },
		{ name: 'Lalieri', links: ['https://lalieri.tumblr.com/'] },
		{ name: 'Ruef-bae', links: ['https://www.deviantart.com/ruef-bae'] },
		{ name: 'Alchemist3rd' },
		{ name: 'Firecracker' },
		{ name: 'ZippySqrl', links: ['https://www.deviantart.com/zippysqrl'] },
		{ name: 'Karnel333' },
		{ name: 'Wellfugzee' },
		{ name: 'ScribblesHeart', links: ['https://www.deviantart.com/scribblesdesu'] },
		{ name: 'dsp2003', links: ['https://dsp2003.tumblr.com/', 'http://www.deviantart.com/dsp2003'] },
		{ name: 'Towmacow Waffles', links: ['https://www.deviantart.com/towmacowwaffles'] },
		{ name: 'OrchidPony', links: ['https://www.deviantart.com/orchidpony'] },
		{ name: 'Cherry Cerise', links: ['https://www.deviantart.com/cherryceriseart'] },
		{ name: 'RADIOstations', links: ['https://twitter.com/stagbeeble'] },
		{ name: 'Ultimate Fluff' },
		{ name: 'SC', links: ['https://0somecunt0.tumblr.com/tagged/sfw'] },
		{ name: 'SailorDolpin', links: ['https://vk.com/id324582699'] },
		{ name: 'Deeraw', links: ['https://www.deviantart.com/deerdraw', 'https://twitter.com/TheOnlyDeeraw'] },
		{ name: 'Aviivix' },
		{ name: 'SnowFl8keAnge1' },
		{ name: '3aHo3a', links: ['https://twitter.com/imnuclearimwild'] },
		],
		},
];
