import { Track } from 'shoukaku';
import FerraLink, { FerraSpotifyOptions, SearchError, SearchResult } from '../FerraLink';

declare class Spotify {
	public constructor(manager: FerraLink);

	public manager: FerraLink;
	private baseURL: string;
	public readonly options: FerraSpotifyOptions;
	public authorization: string;
	private interval: number;

	public check(url: string): boolean;
	public requestAnonymousToken(): Promise<void>;
	public requestToken(): Promise<void>;
	private renew(): Promise<void>;
	private requestData(endpoint: string): Promise<unknown>;
	public resolve(url: string): Promise<SearchResult & SearchError>;
	public fetchPlaylist(id: string): Promise<SearchResult & SearchError>;
	public fetchAlbum(id: string): Promise<SearchResult & SearchError>;
	public fetchArtist(id: string): Promise<SearchResult & SearchError>;
	public fetchTrack(id: string): Promise<SearchResult & SearchError>;
	public search(query: string): Promise<SearchResult & SearchError>;
	private fetchPlaylistTracks(spotifyPlaylist: Record<string, unknown>): Promise<void>;
	public buildUnresolved(track: Record<string, unknown>): Promise<Track>;
	private fetchMetaData(track: Track): Promise<Track>;
	// idk what is this
	private buildTrack(): any;
	public compareValue(value: unknown): boolean;
	private buildResponse(
		loadType: string,
		tracks: Track[],
		playlistName?: string,
		exceptionMsg?: string
	): SearchResult;
}

export default Spotify;
