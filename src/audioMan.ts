import {
	AudioContext,
	IGainNode,
	IAudioContext
} from "standardized-audio-context";

import {
	IDrumInstrument,
	IDrumset,
	DrumsetKeys,
	DrumsetKeyArray,
	IOnset
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
			this.playInstrument(instrument, this.audioCtx.currentTime, 1);
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
	private oldTime: number;
	private handleInterval: number;
	private vergangen: number;

	private debugPianoRoll: Record<string, number[]>;

	public startLoop(): void {
		const audioState = getState().audio;

		const lui = audioState.loopUpdateInterval;
		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;

		this.debugPianoRoll = {};
		for (const instrKey of DrumsetKeyArray) {
			const dl = dLoop.measure[instrKey];
			const instrument = dSet[instrKey];
			if (!dl || !instrument) {
				continue;
			}
			this.debugPianoRoll[instrKey] = [];
		}

		this.stopLoop();

		this.compile();

		this.masterGainNode.gain.setValueAtTime(audioState.masterVolume, 0);
		this.startTime = this.audioCtx.currentTime;
		this.oldTime = this.audioCtx.currentTime - lui;
		this.currentPosition = 0;

		this.loop();
	}

	public stopLoop(): void {
		this.masterGainNode.gain.setValueAtTime(0, 0);
		clearTimeout(this.handleInterval);
	}

	private currentPosition: number;

	private compile(): void {
		const audioState = getState().audio;

		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;

		for (const instrKey of DrumsetKeyArray) {
			const dl = dLoop.measure[instrKey];
			const instrument = dSet[instrKey];
			if (!dl || !instrument) {
				continue;
			}
			dLoop.compiledMeasure[instrKey] = [];

			for (let pIdx = 0; pIdx < dl.length; pIdx++) {
				const part = dl[pIdx];

				for (let dIdx = 0; dIdx < part.length; dIdx++) {
					const digit = part[dIdx];
					const velocity = parseInt(digit, 16) / 15;
					if (isNaN(velocity) || !isFinite(velocity)) {
						continue;
					}

					const position = pIdx + dIdx / part.length;
					const onset: IOnset = {
						position,
						velocity,
						isPlanned: false
					};
					dLoop.compiledMeasure[instrKey].push(onset);
				}
			}
		}
	}

	private loop = () => {
		const now = this.audioCtx.currentTime;
		log("logLoopInterval", now);
		this.vergangen = now - this.oldTime;
		log("logLoopInterval", "vergangen " + this.vergangen);
		log("logLoopInterval", "this.currentPosition " + this.currentPosition);

		const audioState = getState().audio;

		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;
		const bpm = audioState.bpm;
		const bps = bpm / 60;
		const tLui = audioState.loopUpdateInterval;

		const tDeltaNextLoop = 2 * tLui - this.vergangen;
		const tOffset = this.vergangen - tLui;
		log("logLoopInterval", "tDeltaNextLoop " + tDeltaNextLoop);

		let newPosition = this.currentPosition + tLui * bps;
		if (newPosition + tLui * bps > dLoop.denominator) {
			newPosition -= dLoop.denominator;
			log("logLoopInterval", "newPosition RESET: " + newPosition);
		}

		// duration of a quarter note
		const tInterval = 1 / bps;

		const usedInstruments = Object.keys(dLoop.compiledMeasure);
		for (const instrKey of usedInstruments) {
			const onsets = dLoop.compiledMeasure[instrKey] as IOnset[];
			const instrument = dSet[instrKey] as IDrumInstrument;

			for (const onset of onsets) {
				const delta =
					onset.position * tInterval -
					this.currentPosition * tInterval;

				if (delta >= 0 && delta < tLui * 2 && !onset.isPlanned) {
					const onsetTime = now + delta - tOffset;
					this.playInstrument(instrument, onsetTime, onset.velocity);
					this.debugPianoRoll[instrKey].push(
						onsetTime - this.startTime
					);
					onset.isPlanned = true;
					// } else if (delta >= 0 && delta < tLui * 2) {
					// log("logLoopInterval", "already planned: ", onset);
				}

				if (onset.position < this.currentPosition) {
					onset.isPlanned = false;
				}
				if (delta > tLui * 2) {
					onset.isPlanned = false;
				}
			}
		}

		this.currentPosition = newPosition;

		log("logLoopInterval", this.debugPianoRoll);

		this.oldTime = now;

		this.handleInterval = setTimeout(this.loop, tLui * 1000);
	};
}

export const audioManInstance = new AudioMan();
