const Queue = require("./Queue");

class Player {
    constructor(manager, options) {
        this.manager = manager;
        this.guildId = options.guildId;
        this.voiceId = options.voiceId;
        this.textId = options.textId;
        this.shoukaku = options.ShoukakuPlayer;
        this.queue = new Queue();
        this.paused = false;
        this.playing = false;
        this.loop = "none";

        const player = this.shoukaku;
        player.on('start', () => {
            this.playing = true;
            this.manager.emit("trackStart", this, this.queue.current);
        });
        player.on('end', (data) => {
            if (data.reason === 'REPLACED') return this.manager.emit("trackEnd", this);
            if (['LOAD_FAILED', 'CLEAN_UP'].includes(data.reason)) {
                this.queue.previous = this.queue.current;
                this.playing = false;
                this.manager.emit("trackEnd", this, this.queue.current);
                this.queue.current = null;
                return this.play();
            }
            if (this.loop === "track" && this.queue.current) this.queue.unshift(this.queue.current);
            if (this.loop === "queue" && this.queue.current) this.queue.push(this.queue.current);

            this.queue.previous = this.queue.current;
            const current = this.queue.current;
            this.queue.current = null;

            if (this.queue.length) this.manager.emit("trackEnd", this, current);
            else {
                this.playing = false;
                return this.manager.emit("queueEnd", this);
            }
            this.play();
        });
        player.on('closed', (data = WebSocketClosedEvent) => {
            this.playing = false;
            this.manager.emit("PlayerClosed", this, data);
        });
        player.on('exception', (data = TrackExceptionEvent) => {
            this.playing = false;
            this.manager.emit("trackException", this, data);
        });
        player.on('update', (data = PlayerUpdate) => this.manager.emit("PlayerUpdate", this, data));
        player.on('stuck', (data = TrackStuckEvent) => this.manager.emit("trackStuck", this, data));
        player.on('resumed', () => this.manager.emit("PlayerResumed", this));
    }
    get exists() {
        return this.manager.players.has(this.guildId);
    }
    async play() {
        if (!this.exists || !this.queue.length) return;
        let newTrack = this.queue.shift();
        if (!newTrack.track) newTrack = await this.resolve(newTrack);
        this.queue.current = newTrack;

        const playOptions = { track: this.queue.current.track, options: {} };
        if (options) playOptions.options = { ...options, noReplace: false };
        else playOptions.options = { noReplace: false };

        this.shoukaku.playTrack(playOptions);
    }
    async resolve(track) {
        const query = [track.info.author, track.info.title].filter((x) => !!x).join(" - ");
        let result = await this.shoukaku.node.rest.resolve(`ytsearch:${query}`);
        if (!result || !result.tracks.length) {
            result = await this.shoukaku.node.rest.resolve(`ytmsearch:${query}`);
            if (!result || !result.tracks.length) return;
        }
        track.track = result.tracks[0].track;
        return track;
    }
    pause(pause = boolean) {
        if (typeof pause !== 'boolean') throw new RangeError("[FerraLink] => Pause function must be pass with boolean value.");
        if (this.paused === pause || !this.queue.totalSize) return this;
        this.paused = pause;
        this.playing = !pause;
        this.shoukaku.setPaused(pause);
    }
    skip() {
        this.shoukaku.stopTrack();
    }
    setVolume(volume) {
        if (Number.isNaN(volume)) throw new RangeError("[FerraLink] => Volume level must be a number.");
        this.shoukaku.setVolume(volume / 100);
    }
    setVoiceChannel(voiceId) {
        this.voiceId = voiceId;
    }
    setLoop(mode) {
        if (!mode) throw new Error("[FerraLink] => You must have to provide loop mode as argument of setLoop");
        if (!["none", "track", "queue"].includes(mode)) throw new Error("[FerraLink] =>  setLoop arguments are none,track and queue");
        switch (mode) {
            case "none": {
                this.loop = "none";
                break;
            }
            case "track": {
                this.loop = "track";
                break;
            }
            case "queue": {
                this.loop = "queue";
                break;
            }
        }
        return this;
    }
    disconnect() {
        this.pause(true);
        this.voiceId = null;
        this.queue.current = null;
        this.queue.clear();
    }
    destroy() {
        this.disconnect();
        this.shoukaku.connection.disconnect();
        this.manager.players.delete(this.guildId);
        this.manager.emit("playerDestroy", this);
    }
}
module.exports = Player;