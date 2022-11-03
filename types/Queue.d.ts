export = Queue;
declare class Queue extends Array<shoukaku.Track> {
    constructor(...args: any[]);
    current: shoukaku.Track | null | undefined;
    previous: shoukaku.Track | null | undefined;
    get size(): number;
    get totalSize(): number;
    get isEmpty(): boolean;
    get durationLength(): number;
    add(track: shoukaku.Track): Queue;
    remove(index: number): Queue;
    clear(): Queue;
    shuffle(): void;
}
import shoukaku = require("shoukaku");
