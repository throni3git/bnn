import {
	AudioContext,
	IGainNode,
	IAudioContext
} from "standardized-audio-context";

import { IDrumInstrument, IDrumset, DrumsetKeys } from "./types";
import { log } from "./util";
import { getState } from "./store";

export class AudioMan {
	public audioCtx: AudioContext;
	public gainNode: IGainNode<IAudioContext>;

	constructor() {
		this.audioCtx = new AudioContext();
		this.gainNode = this.audioCtx.createGain();
		this.gainNode.gain.setValueAtTime(0, 0);
		this.gainNode.connect(this.audioCtx.destination);
	}

	public async loadDrumset(
		drumset: IDrumset,
		basePath: string
	): Promise<void> {
		const allDrums = Object.keys(drumset) as DrumsetKeys[];
		const loadingPromises = allDrums.map(instrument =>
			this.loadInstrument(drumset[instrument], basePath)
		);

		await Promise.all(loadingPromises);

		for (const instrumentName of allDrums) {
			const instrument = drumset[instrumentName];
			console.log(instrument);
			this.playInstrument(instrument);
		}
	}

	private async loadInstrument(
		instrument: IDrumInstrument,
		basePath: string
	): Promise<void> {
		const result = await fetch(basePath + instrument.url);
		const buffer = await result.arrayBuffer();
		const decoded = await this.audioCtx.decodeAudioData(buffer);
		instrument.audioBuffer = decoded;
	}

	private playInstrument(instrument: IDrumInstrument): void {
		if (!instrument.audioBuffer) {
			return;
		}
		let source = this.audioCtx.createBufferSource(); // creates a sound source
		source.buffer = instrument.audioBuffer; // tell the source which sound to play
		source.connect(this.gainNode); // connect the source to the context's destination (the speakers)
		source.start(0); // play the source now
		// note: on older systems, may have to use deprecated noteOn(time);

		source.loop = true;
	}

	private startTime: number;
	private handleInterval: number;

	public startLoop(): void {
		this.stopLoop();
		this.startTime = Date.now();
		this.handleInterval = setInterval(this.loop, 1000);
		this.loop();
	}

	public stopLoop(): void {
		clearInterval(this.handleInterval);
	}

	private loop = () => {
		const now = Date.now();
		log("logLoopInterval", now - this.startTime);
		log("logLoopInterval", now);
		log("logLoopInterval", this.audioCtx.currentTime);

		const dl = getState().audio.drumLoop;
		const bpm = getState().audio.bpm;
		const interval = 4 / dl.denominator / bpm;
	};
}

export const audioManInstance = new AudioMan();
