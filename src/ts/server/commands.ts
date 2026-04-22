import { range, compact, escapeRegExp } from 'lodash';
// Speed and time command fixes
import {
	MessageType, ChatType, Expression, Eye, Muzzle, Action, Weather, toAnnouncementMessageType,
} from '../common/interfaces';
import { hasRole } from '../common/accountUtils';
import { butterfly, bat, firefly, cloud, getEntityType, getEntityTypeName } from '../common/entities';
import { emojis } from '../client/emoji';
import { IClient, ServerMap } from './serverInterfaces';
import { World } from './world';
import { NotificationService } from './services/notification';
import { UserError } from './userError';
import { parseExpression, expression } from '../common/expressionUtils';
import { filterBadWords } from '../common/swears';
import { randomString } from '../common/stringUtils';
import {
	getCounter, holdToy, getCollectedToysCount, getCollectedToysList, holdItem, playerSleep, playerBlush, playerLove, playerCry,
	setEntityExpression, execAction, teleportTo, openGift
} from './playerUtils';
import { ServerLiveSettings, GameServerSettings } from '../common/adminInterfaces';
import { isCommand, processCommand, clamp, flatten, includes, randomPoint, parseSeason, parseHoliday, toInt } from '../common/utils';
import { createNotifyUpdate, createShutdownServer } from './api/internal';
import { logger } from './logger';
import { pathTo } from './paths';
import { sayTo, sayToEveryone, sayToOthers, sayToAll, saySystem } from './chat';
import { resetTiles } from './serverRegion';
import { updateAccountState } from './accountUtils';
import {
	findEntities, updateMapState, loadMapFromFile, saveMapToFile, saveEntitiesToFile, getSizeOfMap,
	saveMapToFileBinaryAlt, saveRegionCollider, saveMap, loadMap
} from './serverMap';
import { PARTY_LIMIT, tileWidth, tileHeight, MAP_LOAD_SAVE_TIMEOUT } from '../common/constants';
import { PartyService } from './services/party';
import { getRegionGlobal } from '../common/worldMap';
import { swapCharacter } from './characterUtils';
import { writeFileAsync } from 'fs';
import { Account } from './db';
import { defaultHouseSave, removeToolbox, restoreToolbox } from './maps/houseMap';

export interface CommandContext {
	world: World;
	notifications: NotificationService;
	liveSettings: ServerLiveSettings;
	party: PartyService;
	random: (min: number, max: number, floating?: boolean) => number;
}

export type CommandHandler = (
	context: CommandContext, client: IClient, message: string, type: ChatType, target: IClient | undefined,
	settings: GameServerSettings
) => any;

export interface Command {
	names: string[];
	help: string;
	role: string;
	category?: string;
	spam?: boolean;
	handler: CommandHandler;
}

function hasRoleNull(client: IClient, role: string) {
	if (!role) return true; // No role requirement
	if (hasRole(client.account, role)) return true; // Has exact role

	// Role hierarchy: supporter levels
	if (role.startsWith('sup')) {
		const level = parseInt(role.charAt(3), 10);
		return (client.supporterLevel >= level || client.isMod);
	}

	// Role hierarchy: mod < admin < superadmin
	if (client.isMod) return role === 'mod';
	if (hasRole(client.account, 'admin')) return role === 'admin' || role === 'mod';
	if (hasRole(client.account, 'superadmin')) return role === 'superadmin' || role === 'admin' || role === 'mod';

	return false;
}

function command(names: string[], help: string, role: string, handler: CommandHandler, spam = false, category?: string): Command {
	return { names, help, role, handler, spam, category };
}

function emote(names: string[], expr: Expression, timeout?: number, cancellable?: boolean, category?: string) {
	return command(names, '', '', ({ }, { pony }) => setEntityExpression(pony, expr, timeout, cancellable), false, category);
}

function action(names: string[], actionName: Action, category?: string) {
	return command(names, '', '', ({ }, client, _, __, ___, settings) => execAction(client, actionName, settings), false, category);
}

function adminModChat(names: string[], help: string, role: string, type: MessageType, category?: string) {
	return command(names, help, role, ({ }, client, message, _, __, settings) => {
		sayToEveryone(client, message, filterBadWords(message), type, settings);
	}, false, category);
}

function parseWeather(value: string): Weather | undefined {
	switch (value.toLowerCase()) {
		case 'none': return Weather.None;
		case 'rain': return Weather.Rain;
		default: return undefined;
	}
}

function getSpawnTarget(map: ServerMap, message: string) {
	if (message === 'spawn') {
		return randomPoint(map.spawnArea);
	}

	const spawn = map.spawns.get(message);

	if (spawn) {
		return randomPoint(spawn);
	}

	const match = /^(\d+) (\d+)$/.exec(message.trim());

	if (!match) {
		throw new UserError('invalid parameters');
	}

	const [, tx, ty] = match;
	const x = clamp(+tx, 0, map.width - 0.5 / tileWidth);
	const y = clamp(+ty, 0, map.height - 0.5 / tileHeight);
	return { x, y };
}

function execWithFileName(client: IClient, message: string, action: (fileName: string) => Promise<any>) {
	const fileName = message.replace(/[^a-zA-Z0-9_-]/g, '');

	if (!fileName) {
		throw new UserError('invalid file name');
	}

	action(fileName)
		.catch(e => (logger.error(e), e.message))
		.then(error => saySystem(client, error || 'saved'));
}

function shouldNotBeCalled() {
	throw new Error('Should not be called');
}

function isValidMapForEditing(map: ServerMap, client: IClient, checkTimeout: boolean, onlyLeader: boolean) {
	if (map.id !== 'house') {
		saySystem(client, 'Can only be done inside the house');
		return false;
	}

	if (checkTimeout && ((Date.now() - client.lastMapLoadOrSave) < MAP_LOAD_SAVE_TIMEOUT)) {
		saySystem(client, `You need to wait ${Math.floor(MAP_LOAD_SAVE_TIMEOUT / 1000)} seconds before loading or saving again`);
		return false;
	}

	if (onlyLeader && client.party && client.party.leader !== client) {
		saySystem(client, 'Only party leader can do this');
		return false;
	}

	return true;
}

let interval: any;

export function createCommands(world: World): Command[] {
	const commands = compact([
		// chat
		command(['help', 'h', '?'], '/help - show help', '', ({ }, client) => {
			const filtered = commands
				.filter((c: Command) => c.help && hasRoleNull(client, c.role));

			// Group commands by category
			const grouped: { [key: string]: Command[] } = {};
			filtered.forEach((cmd: Command) => {
				const cat = cmd.category || 'Other';
				if (!grouped[cat]) grouped[cat] = [];
				grouped[cat].push(cmd);
			});

			// Build help text with categories
			const helpLines: string[] = [];
			const categoryOrder = ['Chat', 'Actions', 'Pony states', 'Emotes', 'Expressions', 'House', 'Supporters', 'Mod', 'Admin', 'Superadmin', 'Debug', 'Other'];

			for (const cat of categoryOrder) {
				if (grouped[cat]) {
					helpLines.push('\n' + cat);
					helpLines.push(grouped[cat].map((c: Command) => c.help).join('\n'));
				}
			}

			saySystem(client, helpLines.join('\n'));
		}, false, 'Chat'),
		command(['roll', 'rand', 'random'], '/roll [[min-]max] - randomize a number', '',
			({ random }, client, args, type, target, settings) => {
				const ROLL_MAX = 1000000;
				const [, min, max] = /^(?:(\d+)-)?(\d+)$/.exec(args) || ['', '', ''];
				const minValue = clamp((min ? parseInt(min, 10) : 1) | 0, 0, ROLL_MAX);
				const maxValue = clamp((max ? parseInt(max, 10) : 100) | 0, minValue, ROLL_MAX);
				const result = args === '🍎' ? args : random(minValue, maxValue);
				const message = `🎲 rolled ${result} of ${minValue !== 1 ? `${minValue}-` : ''}${maxValue}`;
				sayToOthers(client, message, toAnnouncementMessageType(type), target, settings);
			}, true, 'Chat'),
		command(['s', 'say'], '/s - say', '', shouldNotBeCalled, false, 'Chat'),
		command(['p', 'party'], '/p - party chat', '', shouldNotBeCalled, false, 'Chat'),
		command(['t', 'think'], '/t - thinking balloon', '', shouldNotBeCalled, false, 'Chat'),
		command(['w', 'whisper'], '/w <name> - whisper to player', '', shouldNotBeCalled, false, 'Chat'),
		command(['r', 'reply'], '/r - reply to whisper', '', shouldNotBeCalled, false, 'Chat'),
		command(['shrug'], '/shrug - ¯\\_(ツ)_/¯', '', shouldNotBeCalled, false, 'Chat'),
		command(['e'], '/e - set permanent expression', '', ({ }, { pony }, message) => {
			pony.exprPermanent = parseExpression(message, true);
			setEntityExpression(pony, undefined, 0);
		}, false, 'Chat'),

		// actions
		command(['turn'], '/turn - turn head', '', ({ }, client, _, __, ___, settings) => {
			execAction(client, Action.TurnHead, settings);
		}, false, 'Actions'),
		command(['boop', ')'], '/boop or /) - a boop', '', ({ }, client, message, _, __, settings) => {
			const expression = parseExpression(message, true);

			if (expression) {
				setEntityExpression(client.pony, expression, 800);
			}

			execAction(client, Action.Boop, settings);
		}),
		command(['drop'], '/drop - drop held item', '', ({ }, client, _, __, ___, settings) => {
			execAction(client, Action.Drop, settings);
		}),
		command(['droptoy'], '/droptoy - drop held toy', '', ({ }, client, _, __, ___, settings) => {
			execAction(client, Action.DropToy, settings);
		}),
		command(['open'], '/open - open gift', '', ({ }, client) => {
			openGift(client);
		}),

		// counters
		command(['gifts'], '/gifts - show gift score', '', ({ }, client, _, type, target, settings) => {
			sayToOthers(client, `collected ${getCounter(client, 'gifts')} 🎁`, toAnnouncementMessageType(type), target, settings);
		}, true),
		command(['candies', 'candy'], '/candies - show candy score', '', ({ }, client, _, type, target, settings) => {
			sayToOthers(client, `collected ${getCounter(client, 'candies')} 🍬`, toAnnouncementMessageType(type), target, settings);
		}, true),
		command(['eggs'], '/eggs - show egg score', '', ({ }, client, _, type, target, settings) => {
			sayToOthers(client, `collected ${getCounter(client, 'eggs')} 🥚`, toAnnouncementMessageType(type), target, settings);
		}, true),
		command(['clovers', 'clover'], '/clovers - show clover score', '', ({ }, client, _, type, target, settings) => {
			sayToOthers(client, `collected ${getCounter(client, 'clovers')} 🍀`, toAnnouncementMessageType(type), target, settings);
		}, true),
		command(['toys'], '/toys - show number of collected toys', '', ({ }, client, _, type, target, settings) => {
			const now = Date.now();
			const { collected, total } = getCollectedToysCount(client);

			if (collected === 0) {
				sayToOthers(client, `You don't have any toys yet. Collect gifts to unlock one of the toys`, toAnnouncementMessageType(type), target, settings);
			} else if (client.lastToysCommandTime && (now - client.lastToysCommandTime) < 10000) {
				const list = getCollectedToysList(client);
				sayToOthers(client, `Your toys: ${list.map(n => `#${n}`).join(', ')}`, toAnnouncementMessageType(type), target, settings);
			} else {
				sayToOthers(client, `collected ${collected}/${total} toys`, toAnnouncementMessageType(type), target, settings);
			}

			client.lastToysCommandTime = now;
		}),

	// admin counter modification
	command(['collect'], '/collect <kind> <amount> - grant/remove counters (admin only)', 'admin', ({ }, client, message) => {
		const parts = message.trim().split(/\s+/);
		if (parts.length < 2) {
			throw new UserError('invalid parameters');
		}

		const kind = parts[0];
		if (![ 'gifts', 'eggs', 'clovers', 'candies', 'toy', 'toys' ].includes(kind)) {
			throw new UserError('invalid kind');
		}

		const amount = parseInt(parts[1], 10);
		if (isNaN(amount)) {
			throw new UserError('invalid amount');
		}

		if ([ 'gifts', 'eggs', 'clovers', 'candies' ].includes(kind)) {
			const k = kind as 'gifts' | 'eggs' | 'clovers' | 'candies';
			updateAccountState(client.account, (state: any) => state[k] = Math.max(0, toInt(state[k]) + amount));
			const kindNames: any = { gifts: 'gifts', eggs: 'eggs', clovers: 'clover(s)', candies: 'candies' };
			saySystem(client, `${amount >= 0 ? 'You granted' : 'You removed'} ${Math.abs(amount)} ${kindNames[kind]}`);
		} else {
			// toy(s)
			const n = Math.abs(amount);
			const total = getCollectedToysCount(client).total;
			const m = Math.min(n, total);
			if (m === 0) {
				saySystem(client, 'Invalid parameter for toys');
				return;
			}

			updateAccountState(client.account, (state: any) => {
				let mask = toInt(state.toys);
				if (amount >= 0) {
					for (let i = 0; i < m; i++) mask |= (1 << i);
				} else {
					for (let i = 0; i < m; i++) mask &= ~(1 << i);
				}
				state.toys = mask;
			});

			saySystem(client, `${amount >= 0 ? 'You granted' : 'You removed'} toys 1-${m}`);
		}
	}),
		// other
		command(['unstuck'], '/unstuck - respawn at spawn point', '', ({ world }, client) => {
			world.resetToSpawn(client);
			world.kick(client, '/unstuck');
		}),
		command(['leave'], '/leave - leave the game', '', ({ world }, client) => {
			world.kick(client, '/leave');
		}),
		command(['account'], '/account - view account info in chat', '', ({ }, client) => {
			const creationDate = client.account.createdAt && typeof client.account.createdAt.toISOString === 'function' ?
				client.account.createdAt.toISOString().substring(0, 10).replace(/-/g, '.') : 'unknown';
			const playtime = Math.floor((client.account.counters && (client.account.counters as any).playtime) || 0);
			const days = Math.floor(playtime / 86400);
			const hours = Math.floor((playtime % 86400) / 3600);
			const minutes = Math.floor((playtime % 3600) / 60);

			const parts: string[] = [];
			if (days > 0) parts.push(`${days}d`);
			if (hours > 0) parts.push(`${hours}h`);
			if (minutes > 0) parts.push(`${minutes}m`);
			const playtimeStr = parts.length > 0 ? parts.join(' ') : 'Not Played';

			saySystem(client, `Account ID: ${client.accountId}`);
			saySystem(client, `Creation Date: ${creationDate}`);
			saySystem(client, `Total Playtime: ${playtimeStr}`);
		}),

		// pony states
		command(['sit'], '/sit - sit down or stand up', '', shouldNotBeCalled),
		command(['lie', 'lay'], '/lie - lie down or sit up', '', shouldNotBeCalled),
		command(['fly'], '/fly - fly up or fly down', '', shouldNotBeCalled),
		command(['stand'], '/stand - stand up', '', shouldNotBeCalled),

		// emotes
		command(['blush'], '', '', ({ }, { pony }, message) => playerBlush(pony, message)),
		command(['love', '<3'], '', '', ({ }, { pony }, message) => playerLove(pony, message)),
		command(['sleep', 'zzz'], '', '', ({ }, { pony }, message) => playerSleep(pony, message)),
		command(['cry'], '', '', ({ }, { pony }, message) => playerCry(pony, message)),

		// expressions
		emote(['smile', 'happy'], expression(Eye.Neutral, Eye.Neutral, Muzzle.Smile)),
		emote(['frown'], expression(Eye.Neutral, Eye.Neutral, Muzzle.Frown)),
		emote(['angry'], expression(Eye.Angry, Eye.Angry, Muzzle.Frown)),
		emote(['sad'], expression(Eye.Sad, Eye.Sad, Muzzle.Frown)),
		emote(['thinking'], expression(Eye.Neutral, Eye.Frown2, Muzzle.Concerned)),

		// actions
		action(['yawn'], Action.Yawn),
		action(['laugh', 'lol', 'haha', 'хаха', 'jaja', 'wkwk', 'awok'], Action.Laugh),
		action(['sneeze', 'achoo'], Action.Sneeze),
		action(['excite', 'tada'], Action.Excite),
		action(['magic'], Action.Magic),
		action(['kiss'], Action.Kiss),

		// house
		command(['savehouse'], '/savehouse - saves current house setup', '', async ({ }, client) => {
			if (!isValidMapForEditing(client.map, client, true, false))
				return;

			client.lastMapLoadOrSave = Date.now();

			const savedMap = JSON.stringify(saveMap(client.map,
				{ saveTiles: true, saveEntities: true, saveWalls: true, saveOnlyEditableEntities: true }));

			DEVELOPMENT && console.log(savedMap);

			client.account.savedMap = savedMap;
			await Account.updateOne({ _id: client.accountId }, { savedMap }).exec();

			saySystem(client, 'Saved');
			client.reporter.systemLog(`Saved house`);
		}),
		command(['loadhouse'], '/loadhouse - loads saved house setup', '', ({ world }, client) => {
			if (!isValidMapForEditing(client.map, client, true, true))
				return;

			if (!client.account.savedMap)
				return saySystem(client, 'No saved map state');

			client.lastMapLoadOrSave = Date.now();

			loadMap(world, client.map, JSON.parse(client.account.savedMap),
				{ loadEntities: true, loadWalls: true, loadEntitiesAsEditable: true });

			saySystem(client, 'Loaded');
			client.reporter.systemLog(`Loaded house`);
		}),
		command(['resethouse'], '/resethouse - resets house setup to original state', '', ({ }, client) => {
			if (!isValidMapForEditing(client.map, client, true, true))
				return;

			client.lastMapLoadOrSave = Date.now();

			if (defaultHouseSave) {
				loadMap(world, client.map, defaultHouseSave,
					{ loadEntities: true, loadWalls: true, loadEntitiesAsEditable: true });
			}

			saySystem(client, 'Reset');
			client.reporter.systemLog(`Reset house`);
		}),
		command(['lockhouse'], '/lockhouse - prevents other people from changing the house', '', ({ }, client) => {
			if (!isValidMapForEditing(client.map, client, false, true))
				return;

			client.map.editingLocked = true;

			saySystem(client, 'House locked');
			client.reporter.systemLog(`House locked`);
		}),
		command(['unlockhouse'], '/unlockhouse - enables editing by other people', '', ({ }, client) => {
			if (!isValidMapForEditing(client.map, client, false, true))
				return;

			client.map.editingLocked = false;

			saySystem(client, 'House unlocked');
			client.reporter.systemLog(`House unlocked`);
		}),
		command(['removetoolbox'], '/removetoolbox - removes toolbox from the house', '', ({ world }, client) => {
			if (!isValidMapForEditing(client.map, client, true, true))
				return;

			client.lastMapLoadOrSave = Date.now();

			removeToolbox(world, client.map);

			saySystem(client, 'Toolbox removed');
			client.reporter.systemLog(`Toolbox removed`);
		}),
		command(['restoretoolbox'], '/restoretoolbox - restores toolbox to the house', '', ({ }, client) => {
			if (!isValidMapForEditing(client.map, client, true, true))
				return;

			client.lastMapLoadOrSave = Date.now();

			restoreToolbox(world, client.map);

			saySystem(client, 'Toolbox restored');
			client.reporter.systemLog(`Toolbox restored`);
		}),

		// supporters
		command(['swap'], '/swap <name> - swap character', '', async ({ world }, client, message) => {
			if (!message) {
				return saySystem(client, `You need to provide name of the character`);
			}

			const regex = new RegExp(`^${escapeRegExp(message)}$`, 'i');
			const query = { account: client.account._id, name: { $regex: regex } };
			await swapCharacter(client, world, query);
		}),

		// mod
		adminModChat(['m'], '/m - mod text', 'mod', MessageType.Mod),
		command(['emotetest'], '/emotetest - print all emotes', 'mod', (_context, client) => {
			let text = '';

			for (let i = 0; i < emojis.length;) {
				if (text) {
					text += '\n';
				}

				for (let j = 0; i < emojis.length && j < 20; j++ , i++) {
					text += emojis[i].symbol;
				}
			}

			sayTo(client, client.pony, text, MessageType.Chat);
		}),
		command(['goto'], '/goto <id> [<instance>]', 'mod', ({ world }, client, message) => {
			const [id = '', instance] = message.split(' ');
			const map = world.maps.find(map => map.id === id && map.instance === instance);

			if (map) {
				const { x, y } = randomPoint(map.spawnArea);
				world.switchToMap(client, map, x, y);
			}
		}),
		command(['tp'], '/tp <location> | <x> <y> - teleport to location', 'mod', (_context, client, message) => {
			const { x, y } = getSpawnTarget(client.map, message);
			teleportTo(client, x, y);
		}),

		// admin
		adminModChat(['a'], '/a - admin text', 'admin', MessageType.Admin),
		command(['announce'], '/announce - global announcement', 'admin', ({ }, client, message, _, __, settings) => {
			findEntities(client.map, e => e.type === butterfly.type || e.type === bat.type || e.type === firefly.type)
				.forEach(e => sayToAll(e, message, filterBadWords(message), MessageType.Admin, settings));
		}),
		command(['time'], '/time <hour> - change server time', DEVELOPMENT ? '' : 'admin', ({ world }, _client, message) => {
			if (!/^\d+$/.test(message)) {
				throw new UserError('invalid parameter');
			}

			world.setTime(parseInt(message, 10) % 24);
		}),
		command(['togglerestore'], '/togglerestore - toggle terrain restoration', 'admin', ({ world: { options } }, client) => {
			options.restoreTerrain = !options.restoreTerrain;
			saySystem(client, `restoration is ${options.restoreTerrain ? 'on' : 'off'}`);
		}),
		command(['resettiles'], '/resettiles - reset tiles to original state', 'admin', ({ }, client) => {
			for (const region of client.map.regions) {
				resetTiles(client.map, region);
			}
		}),
		BETA && command(['season'], '/season <season> [<holiday>]', 'admin', ({ world }, _client, message) => {
			const [s = '', h = ''] = message.split(' ');
			const season = parseSeason(s);
			const holiday = parseHoliday(h);

			if (season === undefined) {
				throw new UserError('invalid season');
			} else {
				world.setSeason(season, holiday === undefined ? world.holiday : holiday);
			}
		}),
		BETA && command(['weather'], '/weather <none|rain>', 'admin', ({ }, client, message) => {
			const weather = parseWeather(message);

			if (weather === undefined) {
				throw new UserError('invalid weather');
			} else {
				updateMapState(client.map, { weather });
			}
		}, false, 'Chat'),

		// superadmin
		command(['update'], '/update - prepare server for update', 'superadmin', ({ world, liveSettings }) => {
			createNotifyUpdate(world, liveSettings)();
		}),
		command(['shutdown'], '/shutdown - shutdown server for update', 'superadmin', ({ world, liveSettings }) => {
			createShutdownServer(world, liveSettings)(true);
		}),

		// debug
		DEVELOPMENT && command(['map'], '/map - show map info', '', ({ world }, client) => {
			const map = client.map;
			const { memory, entities } = getSizeOfMap(map);
			const message = `[${map.id}:${map.instance || '-'}] ${world.maps.indexOf(map)}/${world.maps.length} ` +
				`${(memory / 1024).toFixed(2)} kb ${entities} entities`;
			saySystem(client, message);
		}),
		command(['loadmap'], '/loadmap <file name> - load map from file', 'superadmin', ({ world }, client, message) => {
			execWithFileName(client, message, fileName =>
				loadMapFromFile(world, client.map, pathTo('store', `${fileName}.json`), { loadOnlyTiles: true }));
		}),
		command(['savemap'], '/savemap <file name> - save map to file', 'superadmin', (_, client, message) => {
			execWithFileName(client, message, async fileName => {
				await saveMapToFile(client.map, pathTo('store', `${fileName}.json`), { saveTiles: true });
				// await saveMapToFileBinary(client.map, pathTo('store', `${fileName}.bin`));
			});
		}),
		command(['savemapbin'], '/savemapbin <file name> - save map to file', 'superadmin', (_, client, message) => {
			execWithFileName(client, message, fileName => saveMapToFileBinaryAlt(client.map, pathTo('store', `${fileName}.json`)));
		}),
		command(['saveentities'], '/saveentities <file name> - save entities to file', 'superadmin', (_, client, message) => {
			execWithFileName(client, message, fileName => saveEntitiesToFile(client.map, pathTo('store', `${fileName}.txt`)));
		}),
		command(['savehides'], '/savehides - save hides to file', 'superadmin', async ({ world }, client) => {
			const json = world.hidingService.serialize();
			await writeFileAsync(pathTo('store', 'hides.json'), json, 'utf8');
			saySystem(client, 'saved');
		}),
		command(['throwerror'], '/throwerror <message> - throw test error', 'superadmin', (_, _client, message) => {
			throw new Error(message || 'test');
		}),
		BETA && command(['test'], '', 'superadmin', ({ }, client) => {
			client.map.regions.forEach(region => {
				console.log(region.x, region.y, region.colliders.length);
			});
		}),
		BETA && command(['spamchat'], '/spamchat - spam chat messages', 'superadmin',
			({ world, random }, client, _, __, ___, settings) => {
				if (interval) {
					clearInterval(interval);
					interval = undefined;
				} else {
					interval = setInterval(() => {
						if (includes(world.clients, client)) {
							const message = range(random(1, 10)).map(() => randomString(random(1, 10))).join(' ');
							sayToEveryone(client, message, message, MessageType.Chat, settings);
						} else {
							clearInterval(interval);
						}
					}, 100);
				}
			}, false, 'Superadmin'),
		BETA && command(['noclouds'], '/noclouds - remove clouds', 'superadmin', ({ world }, client) => {
			findEntities(client.map, e => e.type === cloud.type).forEach(e => world.removeEntity(e, client.map));
		}, false, 'Superadmin'),
		BETA && command(['msg'], '/msg - say random stuff', 'superadmin', ({ }, client, _, __, ___, settings) => {
			findEntities(client.map, e => !!e.options && e.name === 'debug 2')
				.forEach(e => sayToAll(e, 'Hello there!', 'Hello there!', MessageType.Chat, settings));
		}, false, 'Superadmin'),
		BETA && command(['hold'], '/hold <name> - hold item', 'superadmin', ({ }, client, message) => {
			holdItem(client.pony, getEntityType(message));
		}, false, 'Superadmin'),
		BETA && command(['toy'], '/toy <number> - hold toy', 'superadmin', ({ }, client, message) => {
			holdToy(client.pony, parseInt(message, 10) | 0);
		}, false, 'Superadmin'),
		BETA && command(['dc'], '/dc', 'superadmin', ({ }, client) => {
			client.disconnect(true, false);
		}, false, 'Superadmin'),
		BETA && command(['disconnect'], '/disconnect', 'superadmin', ({ }, client) => {
			client.disconnect(true, true);
		}, false, 'Superadmin'),
		BETA && command(['info'], '/info <id>', 'superadmin', ({ world }, client, message) => {
			const id = parseInt(message, 10) | 0;
			const entity = world.getEntityById(id);

			if (entity) {
				const { id, type, x, y, options } = entity;
				const info = { id, type: getEntityTypeName(type), x, y, options };
				saySystem(client, JSON.stringify(info, null, 2));
			} else {
				saySystem(client, 'undefined');
			}
		}, false, 'Superadmin'),
		BETA && command(['collider'], '/collider', 'superadmin', ({ }, client) => {
			const region = getRegionGlobal(client.map, client.pony.x, client.pony.y);

			if (region) {
				saveRegionCollider(region);
				saySystem(client, 'saved');
				// console.log(region.tileIndices);
			}
		}, false, 'Superadmin'),
		DEVELOPMENT && command(['testparty'], '', 'superadmin', ({ party }, client) => {
			const entities = findEntities(client.map, e => !!e.client && /^debug/.test(e.name || ''));

			for (const e of entities.slice(0, PARTY_LIMIT - 1)) {
				party.invite(client, e.client!);
			}
		}, false, 'Superadmin'),
	]);

	return commands;
}

export function getSpamCommandNames(commands: Command[]): string[] {
	return flatten(commands.filter(c => c.spam).map(c => c.names));
}

export type RunCommand = ReturnType<typeof createRunCommand>;

export const createRunCommand =
	(context: CommandContext, commands: Command[]) =>
		(client: IClient, command: string, args: string, type: ChatType, target: IClient | undefined, settings: GameServerSettings) => {
			command = command.toLowerCase().trim();
			const func = commands.find(c => c.names.indexOf(command) !== -1);

			try {
				if (func && hasRoleNull(client, func.role)) {
					func.handler(context, client, args, type, target, settings);
				} else {
					return false;
				}
			} catch (err) {
				const e: any = err;
				if (e && typeof e.message === 'string') {
					saySystem(client, e.message);
				} else {
					throw err;
				}
			}

			return true;
		};

const chatTypes = new Map<string, ChatType>();
chatTypes.set('p', ChatType.Party);
chatTypes.set('party', ChatType.Party);
chatTypes.set('s', ChatType.Say);
chatTypes.set('say', ChatType.Say);
chatTypes.set('t', ChatType.Think);
chatTypes.set('think', ChatType.Think);
chatTypes.set('ss', ChatType.Supporter);
chatTypes.set('s1', ChatType.Supporter1);
chatTypes.set('s2', ChatType.Supporter2);
chatTypes.set('s3', ChatType.Supporter3);
chatTypes.set('r', ChatType.Whisper);
chatTypes.set('reply', ChatType.Whisper);
chatTypes.set('w', ChatType.Whisper);
chatTypes.set('whisper', ChatType.Whisper);

export function parseCommand(text: string, type: ChatType): { command?: string; args: string; type: ChatType; } {
	if (!isCommand(text) || text.toLowerCase().startsWith('/shrug')) {
		return { args: text, type };
	}

	const { command, args } = processCommand(text);

	if (command) {
		const chatType = chatTypes.get(command.toLowerCase());

		if (chatType !== undefined) {
			if (chatType === ChatType.Think) {
				type = type === ChatType.Party ? ChatType.PartyThink : ChatType.Think;
			} else {
				type = chatType;
			}

			return { args, type };
		}
	}

	return { command, args, type };
}

export function getChatPrefix(type: ChatType) {
	switch (type) {
		case ChatType.Party:
		case ChatType.PartyThink:
			return '/p ';
		case ChatType.Supporter:
			return '/ss ';
		case ChatType.Dismiss:
			return '/dismiss ';
		case ChatType.Whisper:
			return '/w ';
		default:
			return '';
	}
}
