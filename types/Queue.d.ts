export = Queue;
declare class Queue extends Array<shoukaku.Track> {
    constructor(arrayLength?: number | undefined);
    constructor(arrayLength: number);
    constructor(...items: shoukaku.Track[]);
    get size(): number;
    get totalSize(): number;
    get isEmpty(): boolean;
    get durationLength(): number;
    current: shoukaku.Track | null | undefined;
    previous: shoukaku.Track | null | undefined;
    add(track: shoukaku.Track): Queue;
    remove(index: number): Queue;
    clear(): Queue;
    shuffle(): void;
}
import shoukaku = require("shoukaku");
