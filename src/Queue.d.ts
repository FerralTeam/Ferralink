import { Track } from 'shoukaku';

declare class Queue extends Array {
	public constructor();

	public current: null;
	public previous: null;

	public get size(): number;
	public get totalSize(): number;
	public get isEmpty(): boolean;
	public get durationLength(): number;
	public add(track: Track): Queue;
	public remove(index: number): Track;
	public clear(): Queue;
	public shuffle(): void;
}

export default Queue;
