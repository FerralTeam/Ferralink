export = Player;
declare class Player {
    constructor(manager: FerraLink, options: PlayerOptions);
    manager: FerraLink;
    guildId: string;
    voiceId: string;
    textId: string;
    volume: number;
    shoukaku: shoukaku.Player;
    queue: Queue;
    paused: boolean;
    playing: boolean;
    data: Map<string | number, any>;
    loop: LoopType;
    get exists(): boolean;
    play(): Promise<void>;
    resolve(track: shoukaku.Track): Promise<shoukaku.Track>;
    pause(pause?: boolean | undefined): Player;
    skip(): Player;
    seekTo(position: number): Player;
    setVolume(volume: number): Player;
    setTextChannel(textId: string): Player;
    setVoiceChannel(voiceId: string): Player;
    setLoop(method: LoopType): Player;
    disconnect(): void;
    destroy(): void;
}
declare namespace Player {
    export { PlayerOptions, LoopType };
}
import FerraLink = require("./FerraLink");
import shoukaku = require("shoukaku");
import Queue = require("./Queue");
type LoopType = 'none' | 'track' | 'queue';
type PlayerOptions = {
    guildId: string;
    voiceId: string;
    textId: string;
    volume: number;
    ShoukakuPlayer: shoukaku.Player;
};
