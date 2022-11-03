import FerraLink, { PlayerOptions } from './FerraLink';
import { Player as ShoukakuPlayer } from 'shoukaku';
import Queue from './Queue';
import { Track } from 'shoukaku';

declare class Player {
	public constructor(manager: FerraLink, options: PlayerOptions);

	public manager: FerraLink;
	public guildId: string;
	public voiceId: string;
	public textId: string;
	public volume: number;
	public ShoukakuPlayer: ShoukakuPlayer;
	public queue: Queue;
	public paused: boolean;
	public playing: boolean;

	public get exists(): boolean;
	public play(): Promise<void>;
	public resolve(track: Track): Promise<Track>;
	public pause(pause?: boolean): Player;
	public skip(pause?: boolean): Player;
	public seekTo(position: number): Player;
	public setVolume(volume): Player;
	public setTextChannel(textId: string): Player;
	public setVoiceChannel(voiceId: string): Player;
	public setLoop(method: 'none' | 'track' | 'queue'): Player;
	public disconnect(): void;
	public destroy(): void;
}

export default Player;
