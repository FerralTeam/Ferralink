const { EventEmitter } = require("events");
const Queue = require("./Queue");
const Filters = require("./Filter");
const Connection = require("./Connection");
class Player extends EventEmitter {
  constructor(client, node, options) {
    super();
    this.client = client;
    this.queue = new Queue();
    this.node = node;
    this.filters = new Filters(this, this.node);
    this.connection = new Connection(this);
    this.guildId = options.guildId;
    this.voiceId = options.voiceId;
    this.textId = options.textId || null;
    this.connected = false;
    this.playing = false;
    this.paused = false;
    this.loop = "none";
    this.position = 0;
    this.ping = 0;
    this.current = null;
    this.previous = null;
    this.on("event", (data) => this.lavalinkEvent(data).bind(this)());
    this.on("playerUpdate", (packet) => {
      (this.connected = packet.state.connected),
      (this.position = packet.state.position),
      (this.ping = packet.state.ping);
    });
    this.client.emit("playerCreate", this);
  }

  async play(options = {}) {
    if (!this.queue.length) return;
    this.current = this.queue.shift();
    try {
      if (!this.current.track) this.current = await this.current.resolve(this.client);
      this.playing = true;
      this.position = 0;
      this.node.send({
        op: "play",
        guildId: this.guildId,
        track: this.current.track,
        noReplace: options.noReplace || true,
      });
      return this;
    } catch (err) {
      this.client.emit("trackError", this, this.current, null);
    }
  }
  stop() {
    this.position = 0;
    this.playing = false;
    this.node.send({
      op: "stop",
      guildId: this.guildId,
    });
    return this;
  }
  pause(pause = true) {
    if (typeof pause !== "boolean") throw new RangeError("[Ferralink] -> Pause function must be pass with boolean value.");
    this.node.send({
      op: "pause",
      guildId: this.guildId,
      pause,
    });
    this.playing = !pause;
    this.paused = pause;
    return this;
  }
  async seekTo(position) {
    if (Number.isNaN(position)) throw new RangeError("[Ferralink] -> Position must be a number.");
    this.position = position;
    this.node.send({
      op: "seek",
      guildId: this.guildId,
      position,
    });
    return this;
  }
  setVolume(volume) {
    if (Number.isNaN(volume)) throw new RangeError("[Ferralink] -> Volume level must be a number.");
      volume = Math.min(5, Math.max(0, volume));
      this.filters.volume = volume;
      this.filters.updateFilters();
      return this; 
    }
  setLoop(mode) {
    if (!mode) throw new Error("[Ferralink] -> You must have to provide loop mode.");
    if (!["none", "track", "queue"].includes(mode)) throw new Error("[Ferralink] -> setLoop arguments must be none, track and queue");
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
  setTextChannel(channel) {
    if (typeof channel !== "string") throw new RangeError("[Ferralink] -> Provided channel must be a string.");
    this.textChannel = channel;
    return this;
  }
  setVoiceChannel(channel) {
    if (typeof channel !== "string") throw new RangeError("[Ferralink] -> provided channel must be a string.");
    this.voiceChannel = channel;
    return this;
  }
  connect(options = this) {
    let { guildId, voiceChannel, deaf, mute } = options;
    this.send({
      guild_id: guildId,
      channel_id: voiceChannel,
      self_deaf: deaf || true,
      self_mute: mute || false,
    }, true);
    this.connected = true;
  }
  reconnect() {
    if (!this.voiceId) return;
    this.send({
      guild_id: this.guildId,
      channel_id: this.voiceId,
      self_mute: false,
      self_deaf: false,
    });
    return this;
  }
  disconnect() {
    if (this.voiceId === null) return null;
    this.pause(true);
    this.connected = false;
    this.send({
      guild_id: this.guildId,
      channel_id: null,
      self_mute: false,
      self_deaf: false,
    });
    this.voiceId = null;
    return this;
  }
  destroy() {
    this.disconnect();
    this.node.send({
      op: "destroy",
      guildId: this.guildId,
    });
    this.client.emit("playerDestroy", this);
    this.client.players.delete(this.guildId);
  }
  restart() {
    this.filters.updateFilters();
    if (this.current) {
      this.playing = true;
      this.node.send({
        op: "play",
        startTime: this.position,
        noReplace: true,
        guildId: this.guildId,
        track: this.current.track,
        pause: this.paused,
      });
    }
  }
  send(data) {
    this.client.sendData({ op: 4, d: data });
  }
  lavalinkEvent(data) {
    const events = {
      TrackStartEvent() {
        this.playing = true;
        this.paused = false;
        this.client.emit("trackStart", this, this.current, data);
    },
      TrackEndEvent() {
        this.previous = this.current;
        if (this.current && this.loop === "TRACK") {
        this.queue.unshift(this.previousTrack);
        this.client.emit("trackEnd", this, this.currentTrack, data);
        return this.play();
        } else if (this.current && this.loop === "QUEUE") {
        this.queue.push(this.previousTrack);
        this.client.emit("trackEnd", this, this.currentTrack, data);
        return this.play();
    }
    if (this.queue.length === 0) {
        this.playing = false;
        return this.client.emit("queueEnd", this, this.track, data);
    } else if (this.queue.length > 0) {
        this.client.emit("trackEnd", this, this.current, data);
        return this.play();
        }
        this.playing = false;
        this.client.emit("queueEnd", this, this.current, data);
      },
      TrackStuckEvent() {
        this.client.emit("trackError", this, this.current, data);
        this.stop();
      },
      TrackExceptionEvent() {
        this.client.emit("trackError", this, this.track, data);
        this.stop();
      },
      WebSocketClosedEvent() {
        if ([4015, 4009].includes(data.code)) {
          this.send({
            guild_id: data.guildId,
            channel_id: this.voiceId,
            self_mute: this.options.mute || false,
            self_deaf: this.options.deaf || false,
          });
        }
        this.client.emit("socketClosed", this, data);
      },
      default() {
        throw new Error(`An unknown event: ${data}`);
      },
    };
    return events[data.type] || events.default;
  }
}
module.exports = Player;