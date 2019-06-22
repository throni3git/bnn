import {
	AudioContext,
	IGainNode,
	IAudioContext
} from "standardized-audio-context";

import {
	IDrumInstrument,
	IDrumset,
	DrumsetKeys,
	DrumsetKeyArray
} from "./types";
import { log } from "./util";
import { getState, setAudioState } from "./store";

export class AudioMan {
	public audioCtx: AudioContext;
	public masterGainNode: IGainNode<IAudioContext>;

	constructor() {
		this.audioCtx = new AudioContext();
		this.masterGainNode = this.audioCtx.createGain();
		const volume = getState().audio.masterVolume;
		this.masterGainNode.gain.setValueAtTime(volume, 0);
		this.masterGainNode.connect(this.audioCtx.destination);
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
			// this.loopInstrument(instrument);
			this.playInstrument(instrument, this.audioCtx.currentTime + 1, 1);
		}

		setAudioState("drumset", drumset);
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

	private loopInstrument(instrument: IDrumInstrument): void {
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

	private playInstrument(
		instrument: IDrumInstrument,
		startTime: number,
		velocity: number
	): void {
		if (!instrument.audioBuffer) {
			return;
		}
		const source = this.audioCtx.createBufferSource(); // creates a sound source
		source.buffer = instrument.audioBuffer; // tell the source which sound to play

		if (!instrument.gainNode) {
			const gainNode = this.audioCtx.createGain();
			instrument.gainNode = gainNode;

			gainNode.connect(this.masterGainNode);
		}
		instrument.gainNode.gain.setValueAtTime(velocity, startTime);

		source.connect(instrument.gainNode); // connect the source to the context's destination (the speakers)
		source.start(startTime); // play the source now
		// note: on older systems, may have to use deprecated noteOn(time);
	}

	private startTime: number;
	private currentTime: number;
	private handleInterval: number;
	private vergangen: number;

	private debugPianoRoll: Record<string, number[]>;

	public startLoop(): void {
		this.stopLoop();
		this.startTime = this.audioCtx.currentTime;
		this.currentTime = this.audioCtx.currentTime;
		this.currentPosition = 0;

		const lui = getState().audio.loopUpdateInterval;
		this.handleInterval = setInterval(this.loop, lui * 1000);
		this.loop();
	}

	public stopLoop(): void {
		clearInterval(this.handleInterval);
	}

	currentPosition: number;
	private loop = () => {
		const now = this.audioCtx.currentTime;
		log("logLoopInterval", now);
		log("logLoopInterval", this.audioCtx.currentTime);
		this.vergangen = this.audioCtx.currentTime - this.currentTime;
		log("logLoopInterval", this.vergangen);

		const audioState = getState().audio;

		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;
		const bpm = audioState.bpm;
		const lui = audioState.loopUpdateInterval;

		// duration of a quarter note
		const tInterval = 60 / bpm;
		const pFloorCurrent = Math.floor(this.currentPosition);

		this.debugPianoRoll = {};

		for (const instrKey of DrumsetKeyArray) {
			const dl = dLoop.measure[instrKey];
			if (!dl) {
				continue;
			}
			this.debugPianoRoll[instrKey] = [];
			const instrument = dSet[instrKey];

			for (let pIdx = pFloorCurrent; pIdx < dl.length; pIdx++) {
				const part = dl[pIdx];
				const tMicroInterval = tInterval / part.length;

				for (let dIdx = 0; dIdx < part.length; dIdx++) {
					const digit = part[dIdx];
					const velocity = parseInt(digit, 10);
					if (isNaN(velocity) || !isFinite(velocity)) {
						continue;
					}

					const tDeltaMicro = dIdx * tMicroInterval;
					const tDeltaMacro = pIdx * tInterval;
					const delta =
						tDeltaMicro +
						tDeltaMacro -
						this.currentPosition * tInterval;

					if (delta >= 0 && delta < lui) {
						const onsetTime = this.audioCtx.currentTime + delta;
						this.playInstrument(instrument, onsetTime, velocity);
						this.debugPianoRoll[instrKey].push(
							onsetTime - this.startTime
						);
					}
				}
			}
		}
		this.currentPosition += (this.vergangen * bpm) / 60;
		this.currentPosition %= dLoop.denominator;

		log("logLoopInterval", this.debugPianoRoll);

		this.currentTime = this.audioCtx.currentTime;
	};
}

export const audioManInstance = new AudioMan();
