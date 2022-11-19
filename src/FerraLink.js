const { EventEmitter } = require('events');
const { Shoukaku } = require('shoukaku');
const shoukaku = require('shoukaku');
const Player = require('./Player');
const Spotify = require('./module/Spotify');

class FerraLink extends EventEmitter {
	/**
	 * @param {*} client
	 * @param {import('shoukaku').NodeOption[]} nodes
	 * @param {FerraLinkOptions} options
	 */
	constructor(options, connector, nodes, shoukakuoptions) {
		super();

		/** @type {Shoukaku} */
		this.shoukaku = new Shoukaku(connector, nodes, shoukakuoptions);

		/** @type {Map<string, Player>} */
		this.players = new Map();
		
		/** @type {Spotify} */
		if (options) {
		   /** @type {FerraLink.client} */
	           this.client = options.BotClient;
			
		   /** @type {Spotify} */	
		   this.spotify = new Spotify(options);
		}
	}

	/**
	 * Create a new player.
	 * @param {FerraLinkCreatePlayerOptions} options
	 * @returns {Promise<Player>}
	 */
	async createPlayer(options) {
		const existing = this.players.get(options.guildId);
		if (existing) return existing;

		const node = this.shoukaku.getNode();
		if (!node) return console.log('[FerraLink] => No nodes are existing.');

		const ShoukakuPlayer = await node.joinChannel({
			guildId: options.guildId,
			channelId: options.voiceId,
			shardId: options.shardId,
			deaf: options.deaf || true
		});
		const FerraLinkPlayer = new Player(this, {
			client: this.client,
			guildId: options.guildId,
			voiceId: options.voiceId,
			textId: options.textId,
			volume: `${options.volume}` || '80',
			ShoukakuPlayer
		});
		this.players.set(options.guildId, FerraLinkPlayer);
		this.emit('PlayerCreate', FerraLinkPlayer);
		return FerraLinkPlayer;
	}
	
	/**
         * Resolve a track
         * @param {shoukaku.Track} track
         * @returns {Promise<shoukaku.Track>}
         */
	async resolve(track, node) {
		const query = [track.info.author, track.info.title].filter(x => !!x).join(' - ');
		let result = await node.rest.resolve(`ytmsearch:${query}`);
		if (!result || !result.tracks.length) {
			result = await node.rest.resolve(`ytsearch:${query}`);
			if (!result || !result.tracks.length) return;
		}
		track.track = result.tracks[0].track;
		return track;
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
			return await this.shoukaku.getNode('auto')?.rest.resolve(query);
		} else {
			switch (options.engine) {
				case 'spsearch': {
					return this.spotify.search(query);
				}
				default: {
					const source = options?.engine || 'ytsearch';
					return await this.shoukaku.getNode('auto')?.rest.resolve(`${source}:${query}`);
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
