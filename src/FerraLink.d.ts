import EventEmitter from 'events';
import { Shoukaku, NodeOption, Node, LavalinkResponse, Player as ShoukakuPlayer } from 'shoukaku';
import Player from './Player';
import Spotify from './module/Spotify';
import { Track } from 'shoukaku';

declare class FerraLink extends EventEmitter {
	public constructor(client: any, nodes: NodeOption[], options: FerraSpotifyOptions);

	public shoukaku: Shoukaku;
	public players: Map<string, Player>;
	public spotify: Spotify;

	public getNode(): Node;
	public createPlayer(options: PlayerOptions): Promise<Player>;
	public search(
		query: string,
		options?: SearchOptions
	): Promise<(SearchResult & SearchError) | LavalinkResponse | null | undefined>;
	public isCheckURL(url: string): boolean;
}

export interface FerraSpotifyOptions {
	playlistLimit: string;
	albumLimit: string;
	artistLimit: string;
	searchMarket: string;
	clientID: string;
	clientSecret: string;
}

export interface PlayerOptions {
	guildId: string;
	voiceId: string;
	textId?: string;
	shardId?: number;
	volume?: number;
	deaf?: boolean;
	ShoukakuPlayer?: ShoukakuPlayer;
}

export interface SearchOptions {
	engine?: 'ytsearch' | 'ytmsearch' | 'spsearch' | 'scsearch';
}

export interface SearchResult {
	loadType: 'TRACK_LOADED' | 'PLAYLIST_LOADED' | 'SEARCH_RESULT' | 'NO_MATCHES' | 'LOAD_FAILED';
	tracks: Track[];
	playlistInfo: {
		name?: string;
	};
}

export interface SearchError {
	exception?: {
		message: any;
		severity: string;
	};
}

export default FerraLink;
