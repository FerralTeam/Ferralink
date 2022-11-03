export = FerraLink;
declare class FerraLink {
    constructor(client: any, nodes: import('shoukaku').NodeOption[], options: FerraLinkOptions);
    shoukaku: Shoukaku;
    players: Map<string, Player>;
    spotify: Spotify;
    getNode(): import('shoukaku').Node;
    createPlayer(options: FerraLinkCreatePlayerOptions): Promise<Player>;
    search(query: string, options: FerraLinkSearchOptions): Promise<shoukaku.LavalinkResponse>;
    isCheckURL(string: string): boolean;
    on<K extends keyof FerraLinkEvents>(event: K, listener: (...args: FerraLinkEvents[K]) => any): FerraLink;
    once<K_1 extends keyof FerraLinkEvents>(event: K_1, listener: (...args: FerraLinkEvents[K_1]) => any): FerraLink;
}
declare namespace FerraLink {
    export { FerraLinkOptions, FerraLinkSpotifyOptions, FerraLinkCreatePlayerOptions, FerraLinkSearchOptions, FerraLinkEvents };
}
import { Shoukaku } from "shoukaku/dist/src/Shoukaku";
import Player = require("./Player");
import Spotify = require("./module/Spotify");
type FerraLinkCreatePlayerOptions = {
    guildId: string;
    voiceId: string;
    textId: string;
    shardId: number;
    volume?: number | undefined;
    deaf?: boolean | undefined;
};
type FerraLinkSearchOptions = {
    engine?: "ytsearch" | "ytmsearch" | "spsearch" | "scsearch" | undefined;
};
import shoukaku = require("shoukaku");
type FerraLinkEvents = {
    trackStart: [player: Player, track: shoukaku.Track];
    trackEnd: [player: Player, track: shoukaku.Track];
    queueEnd: [player: Player];
    PlayerClosed: [player: Player, data: shoukaku.WebSocketClosedEvent];
    trackException: [player: Player, data: shoukaku.TrackExceptionEvent];
    PlayerUpdate: [player: Player, data: shoukaku.PlayerUpdate];
    trackStuck: [player: Player, data: shoukaku.TrackStuckEvent];
    PlayerResumed: [player: Player];
    playerDestroy: [player: Player];
    playerCreate: [player: Player];
};
type FerraLinkOptions = {
    spotify?: FerraLinkSpotifyOptions | undefined;
};
type FerraLinkSpotifyOptions = {
    playlistLimit: number;
    albumLimit: number;
    artistLimit: number;
    searchMarket: string;
    clientID: string;
    clientSecret: string;
};
