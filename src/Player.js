const Queue = require('./Queue');
const FerraLink = require('./FerraLink');
const shoukaku = require('shoukaku');

class Player {
	/**
	 *
	 * @param {FerraLink} manager
	 * @param {PlayerOptions} options
	 */
	constructor(manager, options) {
		/** @type {FerraLink} */
		this.manager = manager;

		/** @type {string} */
		this.guildId = options.guildId;

		/** @type {string} */
		this.voiceId = options.voiceId;

		/** @type {string} */
		this.textId = options.textId;

		/** @type {number} */
		this.volume = options.volume;

		/** @type {shoukaku.Player} */
		this.shoukaku = options.ShoukakuPlayer;

		/** @type {Queue} */
		this.queue = new Queue();

		/** @type {boolean} */
		this.paused = false;

		/** @type {boolean} */
		this.playing = false;
		
	        /** @type {Data} */
		this.data = new Map();

		/** @type {LoopType} */
		this.loop = 'none';

		const player = this.shoukaku;
		player.on('start', () => {
			this.playing = true;
			this.manager.emit('trackStart', this, this.queue.current);
		});
		player.on('end', data => {
			if (data.reason === 'REPLACED') return this.manager.emit('trackEnd', this);
			if (['LOAD_FAILED', 'CLEAN_UP'].includes(data.reason)) {
				this.queue.previous = this.queue.current;
				this.playing = false;
				this.manager.emit('trackEnd', this, this.queue.current);
				this.queue.current = null;
				return this.play();
			}
			const current = this.queue.current;
			this.queue.previous = this.queue.current;
			this.queue.current = null;
			if (this.loop === 'track') this.queue.unshift(this.queue.previous);
			if (this.loop === 'queue') this.queue.push(this.queue.previous);

			if (this.queue.length) this.manager.emit('trackEnd', this, current);
			else {
				this.playing = false;
				return this.manager.emit('queueEnd', this);
			}
			this.play();
		});
		player.on('closed', (data = WebSocketClosedEvent) => {
			this.playing = false;
			this.manager.emit('PlayerClosed', this, data);
		});
		player.on('exception', (data = TrackExceptionEvent) => {
			this.playing = false;
			this.manager.emit('trackException', this, data);
		});
		player.on('update', (data = PlayerUpdate) => this.manager.emit('PlayerUpdate', this, data));
		player.on('stuck', (data = TrackStuckEvent) => this.manager.emit('trackStuck', this, data));
		player.on('resumed', () => this.manager.emit('PlayerResumed', this));
	}

	/**
	 * Check if player exists
	 * @returns {boolean}
	 */
	get exists() {
		return this.manager.players.has(this.guildId);
	}

	/**
	 * Play the queue
	 * @returns {Promise<void>}
	 */
	async play() {
		if (!this.exists || !this.queue.length) return;
		let newTrack = this.queue.shift();
		if (!newTrack.track) newTrack = await this.resolve(newTrack);
		this.queue.current = newTrack;

		const playOptions = { noReplace: false };
		this.shoukaku
			.playTrack({ track: this.queue.current.track }, playOptions)
			.setVolume(this.volume / 100);
	}

	/**
	 * Resolve a track
	 * @param {shoukaku.Track} track
	 * @returns {Promise<shoukaku.Track>}
	 */
	async resolve(track) {
		const query = [track.info.author, track.info.title].filter(x => !!x).join(' - ');
		let result = await this.shoukaku.node.rest.resolve(`ytmsearch:${query}`);
		if (!result || !result.tracks.length) {
			result = await this.shoukaku.node.rest.resolve(`ytsearch:${query}`);
			if (!result || !result.tracks.length) return;
		}
		track.track = result.tracks[0].track;
		return track;
	}

	/**
	 * Pause or resume the player
	 * @param {boolean} [pause]
	 * @returns {Player}
	 */
	pause(pause = true) {
		if (typeof pause !== 'boolean') throw new RangeError('[FerraLink] => Pause function must be pass with boolean value.');
		if (this.paused === pause || !this.queue.totalSize) return this;
		this.paused = pause;
		this.playing = !pause;
		this.shoukaku.setPaused(pause);
		return this;
	}

	/**
	 * Skip the current track
	 * @returns {Player}
	 */
	skip() {
		this.shoukaku.stopTrack();
		return this;
	}

	/**
	 * Seek to specific time
	 * @param {number} position time in ms
	 * @returns {Player}
	 */
	seekTo(position) {
		if (Number.isNaN(position)) throw new RangeError('[FerraLink] => seek Position must be a number.');
		this.shoukaku.seekTo(position);
		return this;
	}

	/**
	 * Set the volume
	 * @param {number} volume
	 * @returns {Player}
	 */
	setVolume(volume) {
		if (Number.isNaN(volume)) throw new RangeError('[FerraLink] => Volume level must be a number.');
		this.shoukaku.setVolume(volume / 100);
		this.volume = volume;
		return this;
	}

	/**
	 * Change player's text channel
	 * @param {string} textId
	 * @returns {Player}
	 */
	setTextChannel(textId) {
		if (typeof textId !== 'string') throw new RangeError('[FerraLink] => textId must be a string.');
		this.textId = textId;
		return this;
	}

	/**
	 * Change player's voice channel
	 * @param {string} voiceId
	 * @returns {Player}
	 */
	setVoiceChannel(voiceId) {
		if (typeof voiceId !== 'string') throw new RangeError('[FerraLink] => voiceId must be a string.');
		this.voiceId = voiceId;
		return this;
	}

	/**
	 * Change the player's loop mode
	 * @param {LoopType} method
	 * @returns {Player}
	 */
	setLoop(method) {
		if (!method) throw new Error('[FerraLink] => You must have to provide loop method as argument for setLoop.');
		if (method === 'track' || method === 'queue') {
			this.loop = method;
			return this;
		}
		this.loop = 'none';
		return this;
	}

	/**
	 * Disconnect the player
	 * @returns {void}
	 */
	disconnect() {
		this.pause(true);
		this.voiceId = null;
		this.queue.current = null;
		this.queue.clear();
	}

	/**
	 * Destroy the player
	 * @returns {void}
	 */
	destroy() {
		this.disconnect();
		this.shoukaku.connection.disconnect();
		this.manager.emit('playerDestroy', this);
		this.manager.players.delete(this.guildId);
	}
}

module.exports = Player;

/**
 * @typedef PlayerOptions
 * @prop {string} guildId
 * @prop {string} voiceId
 * @prop {string} textId
 * @prop {number} volume
 * @prop {shoukaku.Player} ShoukakuPlayer
 */

/**
 * @typedef {'none' | 'track' | 'queue'} LoopType
 */
