/// <reference path="../../typings/my.d.ts" />

import { Request } from 'express';
import { isString } from 'lodash';
import { Strategy as GoogleStrategy } from '@passport-next/passport-google-oauth2';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as TikTokStrategyBase } from 'passport-tiktok-auth';
import { Strategy as GithubStrategy } from 'passport-github2';

class TikTokStrategy extends TikTokStrategyBase {
	constructor(options: any, verify: any) {
		super(options, verify);
		(this as any).fields = [
			'open_id',
			'avatar_url',
			'display_name'
		];
	}

	authorizationParams(options: any) {
		const params = super.authorizationParams(options);
		params.client_key = (this as any)._oauth2._clientId;
		return params;
	}

	userProfile(accessToken: string, _done: any) {
		const authData = arguments.length > 2 ? arguments[1] : undefined;
		const actualDone = arguments.length > 2 ? arguments[2] : arguments[1];

		const oauth2 = (this as any)._oauth2;
		const fields = '?fields=' + (this as any).fields.join(',');

		oauth2.get((this as any)._profileURL + fields, accessToken, (err: any, body: any, _res: any) => {
			if (err) {
				return actualDone(new Error('Failed to fetch user profile: ' + (err.data || err.message || err)));
			}

			try {
				const json = JSON.parse(body);
				const user = json.data && json.data.user ? json.data.user : json;

				const profile: any = {
					provider: 'tiktok',
					id: user.open_id || user.id || authData?.open_id,
					unionId: user.union_id,
					username: user.username || user.display_name,
					displayName: user.display_name,
					profileImage: user.avatar_url_100 || user.avatar_url,
					bioDescription: user.bio_description,
					profileDeepLink: user.profile_deep_link,
					_raw: body,
					_json: json
				};

				actualDone(null, profile);
			} catch (e) {
				actualDone(e);
			}
		});
	}
}
import { Strategy as VKontakteStrategy } from 'passport-vkontakte';
import { Strategy as PatreonStrategy } from 'passport-patreon';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as SteamStrategy } from 'passport-steam';
import { Profile } from '../common/interfaces';
import { PATREON_COLOR } from '../common/colors';
import { colorToCSS } from '../common/color';
import { config } from './config';
import { IAccount } from './db';

export type OAuthProfileName = any;

export interface OAuthProfile {
	id?: string;
	name?: OAuthProfileName;
	username?: string;
	discriminator?: string; // discord
	displayName?: string;
	email?: string; // discord
	emails?: { value: string; }[];
	provider: string;
	gender?: string;
	profileUrl?: string;
	_raw: string;
	_json: any;
}

export interface Strategy {
	new(
		options: any,
		callback: (
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: OAuthProfile,
			callback: (err: Error | null, user: IAccount | null) => void) => void): any;
}

export interface OAuthProviderInfo {
	id: string;
	name: string;
	color: string;
	strategy: Strategy;
	auth?: any;
	connectOnly?: boolean;
	additionalOptions?: any;
}

const providerList: OAuthProviderInfo[] = [
	{
		id: 'google',
		name: 'Google',
		color: '#DC4A3D',
		connectOnly: false,
		strategy: GoogleStrategy,
	},
	{
		id: 'twitter',
		name: 'Twitter',
		color: '#55ACEE',
		strategy: TwitterStrategy,
	},
	{
		id: 'github',
		name: 'GitHub',
		color: '#800080',
		connectOnly: true,
		strategy: GithubStrategy,
	},
	{
		id: 'vkontakte',
		name: 'VKontakte',
		color: '#4C75A3',
		strategy: VKontakteStrategy,
	},
	{
		id: 'patreon',
		name: 'Patreon',
		color: colorToCSS(PATREON_COLOR),
		connectOnly: true,
		strategy: PatreonStrategy,
	},
	{
		id: 'discord',
		name: 'Discord',
		color: '#7289DA',
		strategy: DiscordStrategy,
	},
	{
		id: 'tiktok',
		name: 'TikTok',
		color: '#FFFFFF',
		connectOnly: false,
		strategy: TikTokStrategy,
	},
	{
		id: 'steam',
		name: 'Steam',
		color: '#171A21',
		connectOnly: false,
		strategy: SteamStrategy,
	},
];

providerList.forEach(p => p.auth = config.oauth[p.id]);
providerList.filter(p => p.auth && p.auth.connectOnly).forEach(p => p.connectOnly = true);

export const providers = providerList.filter(p => !!p.auth);

export function getProfileUrl(profile: OAuthProfile): string | undefined {
	if (profile.provider === 'twitter') {
		return `https://twitter.com/${profile.username}`;
	} else if (profile.provider === 'tumblr') {
		return `http://${profile.username}.tumblr.com/`;
	} else if (profile.provider === 'discord') {
		return undefined;
	} else if (profile._json.attributes && profile._json.attributes.url) { // patreon
		return profile._json.attributes.url;
	} else if (profile.provider === 'steam') {
		return profile._json.profileurl;
	} else {
		return profile.profileUrl || profile._json.url;
	}
}

export function getProfileEmails(profile: OAuthProfile): string[] {
	if (profile.provider === 'discord') {
		// TODO: diagnose why we aren't receiving the email from Discord
		// for now, we just won't attempt to record an email if we don't receive one
		return profile.email ? [profile.email] : [];
	} else if (profile.emails && profile.emails.length) {
		return profile.emails.map(e => e.value);
	} else if (profile._json && profile._json.attributes && profile._json.attributes.email) { // patreon
		return [profile._json.attributes.email];
	} else {
		return [];
	}
}

export function getProfileUsername(profile: OAuthProfile): string | undefined {
	if (profile.provider === 'discord') return `${profile.username}#${profile.discriminator}`;
	return profile.username || profile.displayName || getProfileNameInternal(profile.name);
}

export function getProfileName(profile: OAuthProfile): string | undefined {
	if (profile.provider === 'discord') return `${profile.username}#${profile.discriminator}`;
	return profile.displayName || profile.username || getProfileNameInternal(profile.name);
}

function getProfileNameInternal(name: OAuthProfileName | undefined): string | undefined {
	if (!name || isString(name)) {
		return name as any;
	} else {
		return `${name.givenName} ${name.familyName}`.trim();
	}
}

export function getProfile(provider: string, profile: OAuthProfile): Profile {
	const emails = getProfileEmails(profile).map(e => e.toLowerCase());

	return {
		id: profile.id || profile.username || '',
		provider: profile.provider || provider,
		username: getProfileUsername(profile) || emails[0],
		name: getProfileName(profile) || emails[0],
		emails,
		url: getProfileUrl(profile),
		createdAt: profile._json && profile._json.created_at && new Date(profile._json.created_at),
		suspended: profile._json && profile._json.suspended,
	};
}
