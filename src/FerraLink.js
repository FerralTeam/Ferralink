const { EventEmitter } = require('events');
const FerralinkShoukaku = require('./module/Shoukaku');
const shoukaku = require('shoukaku');
const Player = require('./Player');
const Spotify = require('./module/Spotify');

class FerraLink extends EventEmitter {
	/**
	 * @param {*} client
	 * @param {import('shoukaku').NodeOption[]} nodes
	 * @param {FerraLinkOptions} options
	 */
	constructor(client, Nodes, ShoukakuOptions, options) {
		super();
		
		/** @type {Shoukaku} */
		this.shoukaku = new FerralinkShoukaku(new Connectors.DiscordJS(client), Nodes, ShoukakuOptions);

		/** @type {Map<string, Player>} */
		this.players = new Map();

		/** @type {Spotify} */
		if (options.spotify) {
			this.spotify = new Spotify(options.spotify);
		}
	}

	/**
	 * Create a new player.
	 * @param {FerraLinkCreatePlayerOptions} options
	 * @returns {Promise<Player>}
	 */
	async createPlayer(options) {
		const existing = this.players.get(options.guildId);
		if (!existing) {
			const node = this.getNode();
			const ShoukakuPlayer = await node.joinChannel({
				guildId: options.guildId,
				channelId: options.voiceId,
				shardId: options.shardId,
				deaf: options.deaf || true
			});
			if (!ShoukakuPlayer) return null;
			const FerraLinkPlayer = new Player(this, {
				guildId: options.guildId,
				voiceId: options.voiceId,
				textId: options.textId,
				volume: `${options.volume}` || '80',
				ShoukakuPlayer
			});
			this.players.set(options.guildId, FerraLinkPlayer);
			this.emit('PlayerCreate', FerraLinkPlayer);
			return FerraLinkPlayer;
		} else {
			return existing;
		}
	}

	/**
	 * Get a lavalink node.
	 * @returns {import('shoukaku').Node}
	 */
	getNode() {
		const node = this.shoukaku.getNode('auto');
		if (!node) throw new Error('[FerraLink] => No nodes are existing.');
		return node;
	}

	/**
	 * Search a song in Lavalink providers.
	 * @param {string} query
	 * @param {FerraLinkSearchOptions} options
	 * @returns {Promise<shoukaku.LavalinkResponse>}
	 */
	async search(query, options) {
		const regex = /^https?:\/\//;
		if (regex.test(query)) {
			if (this.spotify.check(query)) return await this.spotify.resolve(query);
			return await this.getNode().rest.resolve(query);
		} else {
			switch (options.engine) {
				case 'spsearch': {
					return this.spotify.search(query);
				}
				default: {
					const source = options?.engine || 'ytsearch';
					return await this.getNode().rest.resolve(`${source}:${query}`);
				}
			}
		}
	}

	/**
	 * Add a listener to a event.
	 * @template {keyof FerraLinkEvents} K
	 * @param {K} event
	 * @param {(...args: FerraLinkEvents[K]) => any} listener
	 * @returns {FerraLink}
	 */
	on(event, listener) {
		super.on(event, listener);
		return this;
	}

	/**
	 * Add a "unique" listener to an event.
	 * @template {keyof FerraLinkEvents} K
	 * @param {K} event
	 * @param {(...args: FerraLinkEvents[K]) => any} listener
	 * @returns {FerraLink}
	 */
	once(event, listener) {
		super.once(event, listener);
		return this;
	}
}

module.exports = FerraLink;

/**
 * @typedef FerraLinkOptions
 * @property {FerraLinkSpotifyOptions} [spotify]
 */

/**
 * @typedef FerraLinkSpotifyOptions
 * @property {number} playlistLimit
 * @property {number} albumLimit
 * @property {number} artistLimit
 * @property {string} searchMarket
 * @property {string} clientID
 * @property {string} clientSecret
 */

/**
 * @typedef FerraLinkCreatePlayerOptions
 * @prop {string} guildId
 * @prop {string} voiceId
 * @prop {string} textId
 * @prop {number} shardId
 * @prop {number} [volume]
 * @prop {boolean} [deaf]
 */

/**
 * @typedef FerraLinkSearchOptions
 * @prop {'ytsearch' | 'ytmsearch' | 'spsearch' | 'scsearch'} [engine]
 */

/**
 * @typedef FerraLinkEvents
 * @prop {[player: Player, track: shoukaku.Track]} trackStart
 * @prop {[player: Player, track: shoukaku.Track]} trackEnd
 * @prop {[player: Player]} queueEnd
 * @prop {[player: Player, data: shoukaku.WebSocketClosedEvent]} PlayerClosed
 * @prop {[player: Player, data: shoukaku.TrackExceptionEvent]} trackException
 * @prop {[player: Player, data: shoukaku.PlayerUpdate]} PlayerUpdate
 * @prop {[player: Player, data: shoukaku.TrackStuckEvent]} trackStuck
 * @prop {[player: Player]} PlayerResumed
 * @prop {[player: Player]} playerDestroy
 * @prop {[player: Player]} playerCreate
 */
