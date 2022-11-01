const { EventEmitter } = require("events");
const { Shoukaku, Connectors } = require("shoukaku");
const options = {
    moveOnDisconnect: false,
    resumable: false,
    resumableTimeout: 30,
    reconnectTries: 15,
    restTimeout: 60000
};
const Player = require("./Player");

class FerraLink extends EventEmitter {
    constructor(client, nodes) {
        super();
        if (!client) throw new Error("[FerraLink] => You need to provide client.");
        if (!nodes) throw new Error("[FerraLink] => You need to provide nodes.");
        this.client = client;
        this.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes, options);
        this.players = new Map();
    }
    async createPlayer(options) {
        const existing = this.players.get(options.guildId);
        if (!existing) {
            const node = this.shoukaku.getNode();
            if (!node) throw new Error("[FerraLink] => No nodes are existing.");
            const ShoukakuPlayer = await node.joinChannel({
                guildId: options.guildId,
                channelId: options.voiceId,
                shardId: options.shardId,
                deaf: options.deaf || true,
            });
            if (!ShoukakuPlayer) return null;
            const FerraLinkPlayer = new Player(
                this,
                {
                    client: this.client,
                    guildId: options.guildId,
                    voiceId: options.voiceId,
                    textId: options.textId,
                    ShoukakuPlayer
                });
            this.players.set(options.guildId, FerraLinkPlayer);
            this.emit("PlayerCreate", FerraLinkPlayer);
            return FerraLinkPlayer;
        } else {
            return existing;
        }
    }
    async search(query, options) {
        const node = this.getLeastUsedNode();
        if (!node) throw new Error("[FerraLink] => No nodes are existing.");
        let result;
        if (this.isCheckURL(query)) {
            result = await this.shoukaku.node.rest.resolve(query);
        } else {
            const source = options?.engine || "ytsearch";
            result = await this.shoukaku.node.rest.resolve(`${source}:${query}`);
        }
        return result;
    }
    isCheckURL(string) {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }
}
module.exports = FerraLink;