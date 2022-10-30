const { EventEmitter } = require("events");
const { fetch } = require("undici");
const Player = require("./Player");
const Node = require("./Node");
const Response = require("./Response");
class Manager extends EventEmitter {
    constructor(client, nodes) {
    super();
      if (!client) throw new Error("[Ferralink] -> You didn't provide a client");
    /**
       * To check client option have client or null
    */
      if (!nodes) throw new Error("[Ferralink] -> You didn't provide a node");
    /**
      * To check nodes are avilable or not
    */
      this.client = client;
    /**
      * The option which added for client
    */
      this.Nodes = nodes;
    /**
      * The Nodes option of nodes
    */
      this.nodes = new Map();
    /**
      * The option of nodes make map
    */
      this.players = new Map();
    /**
      * The option which make players
    */
      this.active = false;
    /**
      * The check player is active or not
    */
      this.user = null;
    /**
      * The option which depect user
    */
      this.sendData = null;
    /**
      * The option which work for porvide sendData
    */
}
    init(client) {
      if (this.ready) return this;
      this.user = client.user.id;
      this.sendData = (data) => {
      const guild = client.guilds.cache.get(data.d.guild_id);
      if (guild) guild.shard.send(data);
    };
      client.on("rawData", async (packet) => {
      await this.packetUpdate(packet);
    });
      this.Nodes.forEach((node) => this.addNode(node));
      this.active = true;
    }
    addNode(options) {
    const node = new Node(this, options, this.options);
    if (options.name) {
      this.nodes.set(options.name || options.host, node);
      node.connect();
      return node;
    }
    this.nodes.set(options.host, node);
    node.connect();
    return node;
    }
    removeNode(identifier) {
    if (!identifier) throw new Error("[Ferralink] -> Provide identifier as a parameter of removeNode");
        const node = this.nodes.get(identifier);
        if (!node) return;
        node.destroy();
        this.nodes.delete(identifier);
    }
    get leastUsedNodes() {
        return [...this.nodes.values()]
          .filter((node) => node.isConnected)
          .sort((a, b) => {
            const aLoad = a.stats.cpu? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100 : 0;
            const bLoad = b.stats.cpu? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100 : 0;
            return aLoad - bLoad;
        });
    }
    getNode(identifier = "main") {
        if (!this.nodes.size) throw new Error("[Ferralink] -> No any nodes avaliable currently");
        if (identifier === "main") return this.leastUsedNodes;
        const node = this.nodes.get(identifier);
        if (!node) throw new Error("[Ferralink] -> The node identifier you provided is not found");
        if (!node.isConnected) node.connect();
        return node;
    }
    check(options) {
        let { guildId, voiceId, textId, shardId } = options;
        if (!guildId) throw new Error("[Ferralink] -> you have to Provide guildId");
        if (!voiceId) throw new Error("[Ferralink] -> you have to  Provide voiceId");
        if (!textId) throw new Error("[Ferralink] -> you have to  Provide textId");
        if (typeof guildId !== "string") throw new Error("[Ferralink] -> guildId must be provided as a string");
        if (typeof voiceChannel !== "string") throw new Error("[Ferralink] -> voiceId must be provided as a string");
        if (typeof textChannel !== "string") throw new Error("[Ferralink] -> textId must be provided as a string");
    }
    create(options) {
        this.checkConnection(options);
        const player = this.players.get(options.guildId);
        if (player) return player;
        if (this.leastUsedNodes.length === 0) throw new Error("[Ferralink] -> No nodes are avaliable");
        let node = this.nodes.get(this.leastUsedNodes[0].name || this.leastUsedNodes[0].host);
        if (!node) throw new Error("[Ferralink] -> No nodes are avalible");
        return this.createPlayer(node, options);
    }
    removeConnection(guildId) {
        this.players.get(guildId)?.destroy();
    }
    createPlayer(node, options) {
        if (this.players.has(options.guildId)) return this.players.get(options.guildId);
        const player = new Player(this, node, options);
        this.players.set(options.guildId, player);
        player.connect(options);
        return player;
    }
    packetUpdate(packet) {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;
        const player = this.players.get(packet.d.guild_id);
        if (!player) return;
        if (packet.t === "VOICE_SERVER_UPDATE") {
            player.connection.setServersUpdate(packet.d);
        }
        if (packet.t === "VOICE_STATE_UPDATE") {
            if (packet.d.user_id !== this.user) return;
            player.connection.setStateUpdate(packet.d);
        }
    }
    async search(query, engine) {
      const node = this.leastUsedNodes[0];
      if (!node) throw new Error("[Ferralink] -> No nodes are available.");
      const regex = /^https?:\/\//;
      if (regex.test(query)) {
        const result = await this.fetch(node, "loadtracks", `identifier=${encodeURIComponent(query)}`);
        if (!result) throw new Error("[Ferralink] ->  No tracks results found.");
        return new Response(result);
      } else {
        let track = `${engine.property || "ytsearch"}:${query}`;
        const result = await this.fetch(node, "loadtracks", `identifier=${encodeURIComponent(track)}`);
        if (!result) throw new Error("[Ferralink] ->  No tracks results found.");
        return new Response(result);
        }
    }
    async decodeTrack(track) {
        const node = this.leastUsedNodes[0];
        if (!node) throw new Error("[Ferralink] -> No nodes are available.");
        const result = await this.fetch(node, "decodetrack", `track=${track}`);
        if (result.status === 500) return null;
        return result;
    }
    fetch(node, endpoint, param) {
        return fetch(
            `http${node.secure ? "s" : ""}://${node.host}:${node.port
            }/${endpoint}?${param}`,
            {
                headers: {
                    Authorization: node.password,
                },
            }
        )
            .then((r) => r.json())
            .catch((e) => {
                throw new Error("[Ferralink] -> Failed to fetch from the lavalink");
            });
    }
    get(guildId) {
        return this.players.get(guildId);
    }
}
module.exports = Manager;
