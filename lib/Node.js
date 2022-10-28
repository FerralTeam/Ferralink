const WebSocket = require("ws");

class Node {
  constructor(client, options, node) {
    this.client = client;
  /**
    * client for lavalink
  */
    this.options = options;
  /**
    * The option which provide in client options
  */
    this.name = this.options.name || null;
  /**
    * The custom name which use for depect node
  */
    this.host = this.options.host || null;
  /**
    * The host for conncect node
  */
    this.port = this.options.port || null;
  /**
    * The ports for recive node actions
  */
    this.password = this.options.password || null;
  /**
    * The password which give access to node
  */
    this.secure = this.options.secure || false;
    /**
     * To check port is secure or not
    */
    this.url = `${this.secure ? "wss" : "ws"}://${this.options.host}:${this.options.port}/`;
    /**
     * The url for connect lavalink
    */
    this.ws = null;
    /**
     * The websocet for lavalink
    */
    this.reconnectTimeout = node.reconnectTimeout || 5000;
    /**
     * The number of reconnectsTimeout for lavalink
    */
    this.reconnectTries = node.reconnectTries || 5;
    /**
     * The number of reconnectTries to Lavalink
    */
    this.reconnectAttempt = null;
    /**
     * The number of reconnectAttempt to Lavalink
    */
    this.attempt = 0;
    /**
     * The number of connect attempt to Lavalink
    */
    this.resumeTimeout = node.resumeTimeout || 60;
    /**
     * The number of resumeTimeout to Lavalink
    */
    this.reconnects = 0;
    /**
     * The number of reconnects to Lavalink
    */
    this.connected = false;
    /**
     * To get node is connect or not
    */
    this.destroyed = null;
    /**
     * The get node in destroyed or not
    */
    this.stats = {
      players: 0,
      playingPlayers: 0,
      uptime: 0,
      memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
      cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
    };
    /**
     * The stats option of lavalink
    */
  }
  connect() {
    if (!this.ws) {
      const main = {
        Authorization: this.options.password,
        "Num-Shards": this.client.shards || 1,
        "User-Id": this.client.user,
        "Client-Name": "FerralLink",
      };
      this.ws = new WebSocket(this.url, { main });
      this.ws.on("open", this.open.bind(this));
      this.ws.on("error", this.error.bind(this));
      this.ws.on("message", this.message.bind(this));
      this.ws.on("close", this.close.bind(this));
    } else this.ws.close();
  }

  disconnect() {
    if (!this.connected) return;
    this.ws?.removeAllListeners();
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }
  reconnect() {
    this.reconnectAttempt = setTimeout(() => {
      if (this.attempt > this.reconnectTries) {
        throw new Error(`[Ferralink] -> Unable to connect with ${this.options.name} node`);
      }
      this.connected = false;
      this.ws?.removeAllListeners();
      this.ws = null;
      this.client.emit("nodeReconnect", this);
      this.connect();
      this.attempt++;
    }, this.reconnectTimeout);
  }
  send(payload) {
    const data = JSON.stringify(payload);
    this.ws.send(data, (error) => {
      if (error) return error;
      return null;
    });
    this.client.emit("rawData", data, this.options.name);
  }
  get penalties() {
    let penalties = 0;
    if (!this.connected) return penalties;
    penalties += this.stats.players;
    penalties += Math.round(
      Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10
    );
    if (this.stats.frameStats) {
      penalties += this.stats.frameStats.deficit;
      penalties += this.stats.frameStats.nulled * 2;
    }
    return penalties;
  }

  open() {
    if (this.reconnectAttempt) {
      clearTimeout(this.reconnectAttempt);
      delete this.reconnectAttempt;
    }
    this.client.emit("nodeConnect", this);
    this.connected = true;
  }
  message(payload) {
    const packet = JSON.parse(payload);
    if (!packet?.op) return;

    if (packet.op === "stats") {
      this.stats = { ...packet };
      delete this.stats.op;
    }
    const player = this.client.players.get(packet.guildId);
    if (packet.guildId && player) player.emit(packet.op, packet);
    packet.node = this;
  }
  close(event) {
    this.disconnect();
    this.client.emit("nodeDisconnect", this, event);
    if (event !== 1000) this.reconnect();
  }
  error(event) {
    if (!event) return "Unknown error";
    this.client.emit("nodeError", this, event);
  }
  async getRoutePlannerStatus() {
    return await this.makeRequest({
      endpoint: "/routeplanner/status",
      headers: {
        Authorization: this.password,
        "User-Agent": "FeeralLink",
      }
    });
  }
  async unmarkFailedAddress(address) {
    return await this.makeRequest({
      endpoint: "/routeplanner/free/address",
      method: "POST",
      headers: {
        Authorization: this.password,
        "User-Agent": "FeeralLink",
        'Content-Type': 'application/json',
      },
      body: { address }
    });
  }
  async makeRequest(data) {
    const url = new URL(`http${this.secure ? "s" : ""}://${this.host}:${this.port}${data.endpoint}`)
    return await fetch(url.toString(), {
      method: data.method || "GET",
      headers: data.headers,
      ...data?.body ? { body: JSON.stringify(data.body) } : {}
    })
      .then((r) => r.json())
      .catch((err) => {
        console.log(err)
        throw new Error(`[Ferralink] -> Unable to makeRequest in ${this.options.name} node`);
      });
  }
}

module.exports = Node;