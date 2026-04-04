require('source-map-support').install();

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const _ = require('lodash');
const gulpif = require('gulp-if');
const rev = require('gulp-rev');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const liveServer = require('gulp-live-server');
const sizereport = require('gulp-sizereport');
const { parse } = require('marked'); // Destructured to avoid IDE resolution warnings
require('markdown-tree');
const del = require('del');
const gulpMocha = require('gulp-spawn-mocha'); // Renamed to prevent type definition collision with the Mocha framework
const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');
const spawn = require('child_process').spawn;
const argv = require('yargs').argv;
const config = require('./config.json');

config.nochangelog = undefined;
const stamp = Math.floor(Math.random() * 0xffffffff);
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
const HASH = _.range(0, 10).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');

let development = true;

function swallowError(e) {
	console.log(e.message);
	this.emit('end');
}

const runAsync = (command, args) => new Promise((resolve, reject) => {
	const proc = spawn(command, args)
		.on('error', reject)
		.on('exit', resolve);

	proc.stdout.pipe(process.stdout);
	proc.stderr.pipe(process.stderr);
});

const readFile = src => fs.readFileSync(src, { encoding: 'utf-8' });

const lintCode = code => (code.trim() + '\n')
	.replace(/\r\n/g, '\n')
	.replace(/ {2}/g, '\t')
	.replace(/"/g, "'");

const npmScript = (name, args = []) => {
	const func = () => runAsync(process.platform === 'win32' ? 'yarn.cmd' : 'yarn', ['run', name, ...args]);
	func.displayName = `yarn run ${name}`;
	return func;
};

const clean = () => del([
	'build/*',
	'temp/*',
	'!temp/.gitignore',
]);

const clearnAdmin = () => del([
	'build/assets-admin',
]);

const manifest = cb => {
	const json = {
		name: config.title,
		short_name: config.title,
		start_url: '/',
		scope: '/',
		theme_color: '#5b6ee1',
		background_color: '#5b6ee1',
		display: 'standalone',
		icons: [
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: '/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png'
			}
		]
	};

	// Outputs to the correct assets directory instead of overwriting the TypeScript changelog file
	fs.writeFile('assets/manifest.json', JSON.stringify(json, null, 2), 'utf8', cb);
};

const sprites = () => Promise.resolve()
	.then(() => runAsync('node', ['src/scripts/tools/create-sprites.js']))
	.then(() => gulp.src('tools/output/images/*', { encoding: false })
		.pipe(gulpif(!argv.fast, imagemin()))
		.pipe(gulp.dest('assets/images')));

const changelog = cb => {
	const changelogText = readFile('CHANGELOG.md');
	const versions = changelogText.split(/^#### /m).filter(x => x.trim());
	const object = config.nochangelog ? [] : versions.map(v => {
		const lines = v.split('\n');
		const version = lines[0].trim();
		const bodyMarkdown = lines.slice(1).join('\n').trim().replace(/\[test]/g, '<span class="badge badge-secondary">test</span>');
		return {
			version,
			html: parse(bodyMarkdown)
		};
	});
	const type = `{ version: string; html: string; }[]`;
	const code = `/* tslint:disable */\n\nexport const CHANGELOG: ${type} = ${JSON.stringify(object, null, 2)};\n`;
	fs.writeFile('src/ts/generated/changelog.ts', lintCode(code), 'utf8', cb);
};

const icons = cb => {
	const root1 = path.join('node_modules', '@fortawesome', 'free-solid-svg-icons');
	const root2 = path.join('node_modules', '@fortawesome', 'free-brands-svg-icons');

	const getIconCode = src => JSON.stringify(require(`./${src}`).definition);
	const iconsTs = readFile('src/ts/client/icons.ts');
	const matched = _.uniq(iconsTs.match(/\bfa[A-Z]\S*\b/g));
	const iconsData = matched.map(m => ({
		name: m,
		code: fs.existsSync(path.join(root1, `${m}.js`)) ? getIconCode(path.join(root1, `${m}.js`)) : getIconCode(path.join(root2, `${m}.js`)),
	})).sort((a, b) => a.name.localeCompare(b.name));
	const code = `/* tslint:disable */\n\n${iconsData.map(({ name, code }) => `export const ${name} = ${code};`).join('\n')}`;
	fs.writeFile('src/ts/generated/fa-icons.ts', lintCode(code), 'utf8', cb);
};

const shaders = cb => {
	function getShaderCode(filePath) {
		return fs.readFileSync(filePath, 'utf8')
			.replace(/^\s*\n/gm, '').trim();
	}

	const dir = path.join('src', 'ts', 'graphics', 'shaders');
	const code = '/* tslint:disable */\n\n' + fs.readdirSync(dir)
		.map(file => [_.camelCase(file.replace(/\.glsl$/, '')), path.join(dir, file)])
		.map(([name, filePath]) => `export const ${name}Shader = \`${getShaderCode(filePath)}\`;`)
		.join('\n\n');
	fs.writeFile('src/ts/generated/shaders.ts', lintCode(code), 'utf8', cb);
};

const hash = cb => {
	const code = `export const HASH = '${HASH}';\nexport const STAMP = ${stamp};`;
	fs.writeFileSync('src/ts/generated/hash.ts', lintCode(code), 'utf8');
	fs.writeFile('src/ts/generated/hash.json', JSON.stringify({ hash: HASH, stamp }), 'utf8', cb);
};

const rollbar = cb => {
	const { environment, clientToken } = config.rollbar || {};
	const code = `export const ROLLBAR_ENV = '${environment}';\nexport const ROLLBAR_TOKEN = '${clientToken}';`;
	fs.writeFile('src/ts/generated/rollbarConfig.ts', lintCode(code), 'utf8', cb);
};

const assetsRev = cb => {
	const json = fs.readFileSync('build/rev-manifest.json', 'utf8');
	const data = _.mapValues(JSON.parse(json), value => value.replace(/^\S+-([a-f0-9]{10})\.\S+$/, '$1'));
	const code = `export const REV: { [key: string]: string; } = ${JSON.stringify(data, null, 4)};`;
	fs.writeFile('src/ts/generated/rev.ts', lintCode(code), 'utf8', cb);
};

const assetsCopy = () => gulp.src('assets/**/*', { encoding: false })
	.pipe(gulpif(!argv.fast, imagemin([
		imagemin.gifsicle({ interlaced: true }),
		imagemin.jpegtran({ progressive: true }),
		imagemin.optipng({ optimizationLevel: 5 }),
		imagemin.svgo({
			plugins: [
				{ removeViewBox: true },
				{ cleanupIDs: false }
			]
		})
	], { silent: true })))
	.pipe(rev())
	.pipe(gulp.dest('build/assets'))
	.pipe(rev.manifest())
	.pipe(gulp.dest('build'));

function buildSass(name, src, dest) {
	const result = () => gulp.src([src], { base: 'src' })
		.pipe(sass.sync({
			includePaths: ['src/styles/'],
			silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'slash-div'],
			quietDeps: true,
		}).on('error', sass.logError))
		.pipe(autoprefixer('last 2 versions'))
		.pipe(gulpif(!development, cssnano({ discardComments: { removeAll: true } })))
		.pipe(gulpif(!development, rev()))
		.pipe(gulp.dest(dest));
	result.displayName = `sass (${name})`;
	return result;
}

const sassMain = buildSass('main', 'src/styles/style.scss', 'build/assets');
const sassInline = buildSass('inline', 'src/styles/style-inline.scss', 'build/assets');
const sassTools = buildSass('tools', 'src/styles/style-tools.scss', 'build/assets');
const sassAdmin = buildSass('admin', 'src/styles/style-admin.scss', 'build/assets-admin');
const sassTasks = gulp.series(sassMain, sassInline, sassTools, sassAdmin);

const testScripts = ['src/scripts/tests/**/*.js'];
const ts = npmScript('ts');

// Separated config objects to avoid IDE signature resolution warnings in the gulp pipeline
const mochaTestConfig = {
	exit: true,
	reporter: 'progress',
	timeout: 10000,
};

const mochaCoverageConfig = {
	exit: true,
	reporter: 'progress',
	timeout: 10000,
	istanbul: {
		print: 'none',
	},
};

// noinspection JSCheckFunctionSignatures
const tests = () => gulp.src(testScripts, { read: false })
	.pipe(gulpMocha(mochaTestConfig))
	.on('error', swallowError);

// noinspection JSCheckFunctionSignatures
const coverage = () => gulp.src(testScripts, { read: false })
	.pipe(gulpMocha(mochaCoverageConfig));

const remap = () => gulp.src('coverage/coverage.json')
	.pipe(remapIstanbul({ reports: { html: 'coverage-remapped' } }));

const size = () => gulp.src([
	'build/assets/*.js',
	'build/assets/scripts/*.js',
	'build/assets-admin/scripts/*.js',
	'build/assets/styles/*.css',
	'build/assets-admin/styles/*.css',
]).pipe(sizereport({ gzip: true, total: true }));

const music = () => gulp.src(path.join(config.assetsPath, 'assets/music/*.wav'), { read: false, encoding: false })
	.pipe(shell([
		'ffmpeg -y -i "<%= file.path %>" -acodec libmp3lame "<%= out(file.path, ".mp3") %>"',
		'ffmpeg -y -i "<%= file.path %>" -acodec libvorbis "<%= out(file.path, ".webm") %>"',
	], {
		templateData: {
			out: (file, ext) => path.join('assets', 'music', path.basename(file, '.wav') + ext),
		}
	}));

const serverDev = cb => {
	if (!argv.noserver) {
		const serverPath = path.join('src', 'scripts', 'server', 'server.js');
		const options = { env: { NODE_OPTIONS: '--inspect' } };
		const commonArgs = [serverPath, '--inspect', '--color', '--beta', '--admin'];
		const server = argv.adm ?
			liveServer([...commonArgs, '--adm'], options) :
			liveServer([...commonArgs, '--login', '--game', '--tools'], options);
		server.start();

		const restart = cb => {
			server.start();
			cb();
		};

		gulp.watch(['build/**/*.css']).on('change', path => server.notify({ path }));
		gulp.watch(['build/**/*.js']).on('change', path => server.notify({ path }));
		gulp.watch([
			'src/scripts/common/**/*.js',
			'src/scripts/generated/**/*.js',
			'src/scripts/graphics/**/*.js',
			'src/scripts/server/**/*.js',
			'views/index.pug',
		], { debounceDelay: 1000 }, restart);
	}

	cb();
};

const webpackProd = npmScript(argv.parallel ? 'webpack-prod-parallel' : (argv.debug ? 'webpack-debug' : (argv.main ? 'webpack-main' : 'webpack-prod')),
	[...(argv.beta ? ['--env.beta'] : []), ...(argv.timing ? ['--env.timing'] : [])]);

const webpackAdmin = npmScript('webpack-admin');
const sw = npmScript('sw');

const assets = gulp.series(assetsCopy, assetsRev);
const common = gulp.series(manifest, hash, rollbar, changelog, icons, shaders, assets, sassTasks);
const covRemap = gulp.series(coverage, remap);

const watch = cb => {
	gulp.watch(['CHANGELOG.md'], changelog);
	gulp.watch(['src/ts/client/icons.ts'], icons);
	gulp.watch(['src/styles/**/*.scss'], sassTasks);
	gulp.watch(['src/ts/graphics/shaders/*.glsl'], shaders);

	if (argv.coverage || argv.tests) {
		gulp.watch(['src/scripts/**/*.js'], { debounceDelay: 1000 }, argv.coverage ? covRemap : tests);
	}

	cb();
};

const watchTools = cb => {
	if (argv.sprites) {
		gulp.watch(['src/ts/tools/trigger.txt'], sprites);
		gulp.watch(['assets/**/*'], { debounceDelay: 1000, readDelay: 1000 }, assets);
	}
	cb();
};

const watchTests = cb => {
	const task = argv.coverage ? covRemap : tests;
	gulp.watch(['src/scripts/**/*.js', 'src/tests/**/*.txt', 'src/tests/**/*.png'], { debounceDelay: 1000 }, task);
	cb();
};

const setProd = cb => {
	development = false;
	cb();
};

const warnAboutTscBeingDumb = cb => { console.log('You might see warnings'); cb(); };

const generateDummySprites = cb => {
	const fs = require('fs');
	const path = require('path');
	const generatedDir = path.join(__dirname, 'src', 'ts', 'generated');
	const spritesFile = path.join(generatedDir, 'sprites.ts');

	if (!fs.existsSync(spritesFile)) {
		console.log('Dummy sprites.ts not found, generating minimal stub...');
		if (!fs.existsSync(generatedDir)) {
			fs.mkdirSync(generatedDir, { recursive: true });
		}
		const stubContent = `/* tslint:disable */
// @ts-nocheck
const emptyArray = [];
const handler = {
	get: function(target, prop) {
		if (prop === 'length') return 0;
		if (prop === 'reduce') return function() { return 0; };
		if (prop === 'map' || prop === 'filter' || prop === 'slice') return function() { return proxyArray; };
		if (prop === Symbol.iterator) return function*() {};
		if (typeof prop === 'symbol' || prop === 'then') return undefined;
		return proxyArray;
	},
	apply: function() { return proxyArray; }
};
const proxyArray: any = new Proxy(emptyArray, handler);

export const spriteSheets: any[] = [];
export const normalSpriteSheet: any = { data: undefined, texture: undefined, sprites: [], isSingleChannel: false, palette: false };
export const paletteSpriteSheet: any = { data: undefined, texture: undefined, sprites: [], isSingleChannel: false, palette: true };
export const defaultPalette = 0;
export function createSprites(_: any) { return [{ x:0,y:0,w:0,h:0,ox:0,oy:0,type:0 }]; }

`;
        let exportsContent = '';
        const keys = [
            'apple_1', 'apple_2', 'arrow_down', 'arrow_left', 'backAccessories', 'backBehindManes',
            'backFrontManes', 'backLegAccessories', 'backLegAccessories2', 'backLegHooves',
            'backLegHooves2', 'backLegSleeves', 'backLegSleeves2', 'backLegs', 'backLegs2', 'banana',
            'barrel', 'basket_bin', 'bat', 'behindManes', 'bench_1', 'bench_back', 'bench_backh',
            'bench_backh2', 'bench_seat', 'bench_seath', 'blush', 'boat', 'boat_front', 'boat_rope',
            'boat_sail', 'boat_wake', 'body', 'bookshelf', 'box_baskets', 'box_empty', 'box_fruits',
            'box_gifts', 'box_lanterns', 'broom', 'bunny', 'butterfly', 'candy', 'candy_cane_1',
            'candy_cane_2', 'carrot_1', 'carrot_1b', 'carrot_2', 'carrot_2b', 'carrot_3', 'carrot_4',
            'carrot_hold', 'carts_bakso', 'carts_sate_lit', 'carts_sate_unlit', 'cat', 'cat_light',
            'caveTiles', 'cave_walls_bot_s1', 'cave_walls_bot_s2', 'cave_walls_bot_s3', 'cave_walls_bot_sb',
            'cave_walls_bot_se', 'cave_walls_bot_sw', 'cave_walls_bot_trim_left', 'cave_walls_bot_trim_right',
            'cave_walls_decal_1', 'cave_walls_decal_2', 'cave_walls_decal_3', 'cave_walls_decal_l',
            'cave_walls_decal_r', 'cave_walls_mid_s1', 'cave_walls_mid_s2', 'cave_walls_mid_s3',
            'cave_walls_mid_sb', 'cave_walls_mid_se1', 'cave_walls_mid_se2', 'cave_walls_mid_sw1',
            'cave_walls_mid_sw2', 'cave_walls_mid_trim_left', 'cave_walls_mid_trim_right', 'cave_walls_s1',
            'cave_walls_s2', 'cave_walls_s3', 'cave_walls_sb', 'cave_walls_se', 'cave_walls_sw',
            'cave_walls_top_e', 'cave_walls_top_n', 'cave_walls_top_ne', 'cave_walls_top_nw',
            'cave_walls_top_s1', 'cave_walls_top_s2', 'cave_walls_top_s3', 'cave_walls_top_sb',
            'cave_walls_top_se', 'cave_walls_top_sw', 'cave_walls_top_trim_left', 'cave_walls_top_trim_right',
            'cave_walls_top_w', 'chestAccessories', 'chestAccessoriesBehind', 'christmastree',
            'cliffs_grass_bot_s1', 'cliffs_grass_bot_s2', 'cliffs_grass_bot_s3', 'cliffs_grass_bot_sb',
            'cliffs_grass_bot_se', 'cliffs_grass_bot_sw', 'cliffs_grass_bot_trim_left', 'cliffs_grass_bot_trim_right',
            'cliffs_grass_decal_1', 'cliffs_grass_decal_2', 'cliffs_grass_decal_3', 'cliffs_grass_decal_l',
            'cliffs_grass_decal_r', 'cliffs_grass_mid_s1', 'cliffs_grass_mid_s2', 'cliffs_grass_mid_s3',
            'cliffs_grass_mid_sb', 'cliffs_grass_mid_se1', 'cliffs_grass_mid_se2', 'cliffs_grass_mid_sw1',
            'cliffs_grass_mid_sw2', 'cliffs_grass_mid_trim_left', 'cliffs_grass_mid_trim_right',
            'cliffs_grass_s1', 'cliffs_grass_s2', 'cliffs_grass_s3', 'cliffs_grass_sb', 'cliffs_grass_se',
            'cliffs_grass_sw', 'cliffs_grass_top_e', 'cliffs_grass_top_n', 'cliffs_grass_top_ne',
            'cliffs_grass_top_nw', 'cliffs_grass_top_s1', 'cliffs_grass_top_s2', 'cliffs_grass_top_s3',
            'cliffs_grass_top_sb', 'cliffs_grass_top_se', 'cliffs_grass_top_sw', 'cliffs_grass_top_trim_left',
            'cliffs_grass_top_trim_right', 'cliffs_grass_top_w', 'cloud', 'clover_1', 'clover_2', 'clover_3',
            'clover_4', 'clover_5', 'clover_mouth', 'clover_patch3', 'clover_patch4', 'clover_patch5',
            'clover_patch6', 'clover_patch7', 'clover_pick', 'cms', 'cmsFlip', 'cookie', 'cookie_pony',
            'cookie_table_1', 'cookie_table_2', 'crate_1', 'crate_2', 'crate_3', 'crystal_lantern',
            'crystals_1', 'crystals_10', 'crystals_2', 'crystals_3', 'crystals_4', 'crystals_5', 'crystals_6',
            'crystals_7', 'crystals_8', 'crystals_9', 'crystals_cart_pile', 'crystals_held', 'cushion_1',
            'direction_down_left', 'direction_down_right', 'direction_left_right',
            'direction_pole_3', 'direction_pole_4', 'direction_pole_5', 'direction_shadow_down_left',
            'direction_shadow_down_right', 'direction_shadow_left', 'direction_shadow_right',
            'direction_shadow_up_left', 'direction_shadow_up_right', 'direction_up_left', 'direction_up_right',
            'dirt_ice_heightmap', 'dirt_stone_cave_height_map', 'dirt_water_heightmap', 'earAccessories',
            'earAccessoriesBehind', 'ears', 'earsFar', 'egg_1', 'egg_10', 'egg_11', 'egg_12', 'egg_13',
            'egg_14', 'egg_15', 'egg_16', 'egg_17', 'egg_18', 'egg_19', 'egg_2', 'egg_20', 'egg_21', 'egg_22',
            'egg_23', 'egg_3', 'egg_4', 'egg_5', 'egg_6', 'egg_7', 'egg_8', 'egg_9', 'egg_basket_1',
            'egg_basket_2', 'egg_basket_3', 'egg_basket_4', 'emoji', 'emojiPal', 'emojiPalette', 'emote_cry2',
            'emote_hearts', 'emote_sleep1', 'emote_sleep1_flip', 'emote_sleep2', 'emote_sleep2_flip',
            'emote_sneeze', 'emote_tears', 'emptySprite', 'emptySprite2', 'extraAccessories',
            'extraAccessoriesBehind', 'eyeLeft', 'eyeRight', 'faceAccessories', 'faceAccessories2',
            'faceAccessories2Extra', 'faceAccessoriesExtra', 'facialHair', 'facialHairBehind', 'fence_1',
            'fence_2', 'fence_3', 'fence_winter_1', 'fence_winter_2', 'fence_winter_3', 'find', 'findIndex',
            'firefly', 'firefly_light', 'flower_1', 'flower_2', 'flower_3', 'flower_patch1', 'flower_patch2',
            'flower_patch3', 'flower_patch4', 'flower_patch5', 'flower_patch6', 'flower_patch7', 'flower_pick',
            'font', 'fontMono', 'fontMonoPal', 'fontPal', 'fontPalette', 'fontSmall', 'fontSmallPal',
            'fontSmallPalette', 'fontSmallSupporter1Palette', 'fontSmallSupporter2Palette',
            'fontSmallSupporter3Palette', 'fontSupporter1Palette', 'fontSupporter2Palette',
            'fontSupporter3Palette', 'food_on_plates_mangkok', 'food_on_plates_mangkok_bakso',
            'food_on_plates_piringkecil', 'food_on_plates_piringkecil_sate', 'forEach', 'frontLegAccessories',
            'frontLegHooves', 'frontLegSleeves', 'frontLegs', 'frontManes', 'ghost1', 'ghost1_hooves',
            'ghost1_hooves_light', 'ghost1_light', 'gift_1', 'gift_2', 'giftpile_1', 'giftpile_2', 'giftpile_3',
            'giftpile_4', 'giftpile_5', 'giftpile_6', 'giftpile_pine', 'giftpile_sign', 'giftpile_tree',
            'grapes_1', 'grapes_2', 'grapes_3', 'grapes_4', 'grapes_5', 'grapes_6', 'grapes_7', 'grapes_one',
            'grassTiles', 'grassTilesNew', 'grass_2', 'grass_tile', 'hammer', 'head', 'head0', 'head1',
            'headAccessories', 'headAccessoriesBehind', 'hold_poof', 'holly', 'horns', 'hornsBehind', 'house',
            'iceTiles', 'indo_flags_1', 'indo_flags_2', 'jacko_lantern_light', 'jacko_lantern_off',
            'jacko_lantern_on', 'lantern', 'lantern_light', 'large_leafed_bush_1', 'large_leafed_bush_2',
            'large_leafed_bush_3', 'large_leafed_bush_4', 'leafpile_big', 'leafpile_bigstick',
            'leafpile_medium', 'leafpile_mediumalt', 'leafpile_small', 'leafpile_stick', 'leaves_1',
            'leaves_2', 'leaves_3', 'leaves_4', 'leaves_5', 'leci_1', 'leci_2', 'leci_3', 'leci_4', 'lemon_1',
            'length', 'letter', 'light6', 'light_crystal_lantern', 'light_crystals_1', 'light_crystals_10',
            'light_crystals_2', 'light_crystals_3', 'light_crystals_4', 'light_crystals_5', 'light_crystals_6',
            'light_crystals_7', 'light_crystals_8', 'light_crystals_9', 'light_crystals_cart_pile',
            'light_crystals_held', 'magic2', 'magic2_light', 'magic3', 'magic_icon', 'mango', 'map',
            'mine_cart', 'mine_cart_back', 'mine_cart_front', 'mine_closed', 'mine_entrance',
            'mine_rail_fade_up', 'mine_rails_end_left', 'mine_rails_end_right', 'mine_rails_end_top',
            'mine_rails_h', 'mine_rails_ne', 'mine_rails_nse', 'mine_rails_nsw', 'mine_rails_nw',
            'mine_rails_nwe', 'mine_rails_se', 'mine_rails_sw', 'mine_rails_swe', 'mine_rails_v', 'mistletoe',
            'neckAccessories', 'nipple_2', 'nipple_alt_2', 'noses', 'orange_1',
            'orange_2', 'pear', 'pickaxe', 'picture_1', 'pier_leg', 'pine_1', 'pine_2',
            'pine_3Crown0_0', 'pine_3Stump0', 'pine_4Crown0_0', 'pine_4Stump0', 'pine_5Crown0_0',
            'pine_5Stump0', 'pine_6Crown0_0', 'pine_6Stump0', 'pixel', 'pixel2', 'pixelRect2', 'plank_1',
            'plank_2', 'plank_3', 'plank_4', 'plank_shadow', 'plank_shadow2', 'plank_shadow_short',
            'plank_short_1', 'plank_short_2', 'plank_short_3', 'ponTails', 'ponySelections', 'ponyShadows',
            'pony_wake_1', 'pony_wake_2', 'pony_wake_3', 'pony_wake_4', 'pony_wake_5', 'pony_wake_6', 'poof',
            'poof2', 'pumpkin_default', 'pumpkin_light', 'pumpkin_off', 'pumpkin_on', 'push',
            'raflesia_arnoldi_1', 'raflesia_arnoldi_2', 'rain', 'raindrop', 'rainfall', 'rake', 'rock',
            'rock_1', 'rock_2', 'rock_3', 'rope_rack', 'rose', 'route_pole', 'saw', 'shovel', 'sign_1',
            'sign_2', 'sign_3', 'sign_4', 'sign_winter', 'snowOnIceTiles', 'snowTiles', 'snowpile_big',
            'snowpile_medium', 'snowpile_small', 'snowpile_tinier', 'snowpile_tiny', 'snowpony_1',
            'snowpony_2', 'snowpony_3', 'snowpony_4', 'snowpony_5', 'snowpony_6', 'snowpony_7', 'snowpony_8',
            'snowpony_9', 'sort', 'spider', 'splash', 'splash_boop', 'stalactite_1',
            'stalactite_2', 'stalactite_3', 'stone2Tiles', 'stoneTiles', 'stone_wall_6', 'stone_wall_full',
            'stone_wall_horizontal1', 'stone_wall_pole1', 'stone_wall_vertical1', 'stone_wall_winter_horizontal1',
            'stone_wall_winter_pole1', 'stone_wall_winter_vertical1', 'table_1', 'table_2', 'table_3', 'tails',
            'tile', 'tile_none', 'tombstone_1', 'tombstone_2', 'toolbox_empty', 'toolbox_full', 'tools_icon',
            'topManes', 'torch2', 'torch2_light', 'tree_1', 'tree_2', 'tree_3', 'tree_4Crown0_0', 'tree_4Stump0',
            'tree_4Trunk0', 'tree_5Crown0_0', 'tree_5Stump0', 'tree_5Trunk0', 'tree_6Crown0_0', 'tree_6Crown0_1',
            'tree_6Crown1_0', 'tree_6Crown1_1', 'tree_6Stump0', 'tree_6Stump1', 'tree_6StumpWinter0',
            'tree_6StumpWinter1', 'tree_6Trunk0', 'tree_6Trunk1', 'ts', 'waistAccessories', 'wall_map',
            'wall_stone_full', 'wall_stone_half', 'wall_wood_full', 'wall_wood_half', 'waterTiles1',
            'waterTiles2', 'waterTiles3', 'waterTiles4', 'water_crystal_1', 'water_crystal_1_light',
            'water_crystal_2', 'water_crystal_2_light', 'water_crystal_3', 'water_crystal_3_light',
            'water_rock_1', 'water_rock_10', 'water_rock_11', 'water_rock_2', 'water_rock_3', 'water_rock_4',
            'water_rock_5', 'water_rock_6', 'water_rock_7', 'water_rock_8', 'water_rock_9', 'web', 'well',
            'window_1', 'wings', 'woodTiles', 'wooden_fence_horizontal1', 'wooden_fence_horizontal2',
            'wooden_fence_horizontal3', 'wooden_fence_horizontal4', 'wooden_fence_horizontal5',
            'wooden_fence_horizontal6', 'wooden_fence_pole1', 'wooden_fence_pole2', 'wooden_fence_pole3',
            'wooden_fence_pole4', 'wooden_fence_pole5', 'wooden_fence_vertical1', 'wooden_fence_vertical2',
            'wooden_fence_vertical3', 'wooden_fence_winter_horizontal1', 'wooden_fence_winter_horizontal2',
            'wooden_fence_winter_horizontal3', 'wooden_fence_winter_horizontal4', 'wooden_fence_winter_horizontal5',
            'wooden_fence_winter_horizontal6', 'wooden_fence_winter_pole1', 'wooden_fence_winter_pole2',
            'wooden_fence_winter_pole3', 'wooden_fence_winter_pole4', 'wooden_fence_winter_pole5',
            'wooden_fence_winter_vertical1', 'wooden_fence_winter_vertical2', 'wooden_fence_winter_vertical3',
            'frontLegSleeves'
        ];

        for (const key of keys) {
            exportsContent += `export const ${key}: any = proxyArray;\n`;
        }

		fs.writeFileSync(spritesFile, stubContent + exportsContent);
	}
	cb();
};
const tsTools = gulp.series(warnAboutTscBeingDumb, generateDummySprites, npmScript('ts-tools'));
const buildSprites = gulp.series(tsTools, sprites);
const spritesTask = argv.sprites ? buildSprites : tsTools;

const build = gulp.series(clean, setProd, common, ts, webpackProd, sw, size);
const admin = gulp.series(clearnAdmin, setProd, sassAdmin, ts, webpackAdmin);
const dev = gulp.series(clean, ts, spritesTask, common, gulp.parallel(serverDev, watch, watchTools));

module.exports = {
	music,
	admin,
	build,
	dev,
	sprites: buildSprites,
	default: dev,
	test: watchTests,
};
