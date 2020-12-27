import {
	AudioContext,
	IGainNode,
	IAudioContext,
} from "standardized-audio-context";

import * as Store from "./store";
import * as Types from "./types";
import { log } from "./util";
import { LOOP_UPDATE_INTERVAL } from "./constants";

export class AudioMan {
	public audioCtx: AudioContext;
	public masterGainNode: IGainNode<IAudioContext>;

	constructor() {
		this.audioCtx = new AudioContext();
		this.masterGainNode = this.audioCtx.createGain();
		const volume = Store.getState().audio.masterVolume;
		this.masterGainNode.gain.setValueAtTime(volume, 0);
		this.masterGainNode.connect(this.audioCtx.destination);
	}

	public async loadDrumset(
		drumset: Types.IDrumset,
		basePath: string
	): Promise<void> {
		const allDrums = Object.keys(drumset) as Types.DrumsetKeys[];
		const loadingPromises = allDrums.map((instrument) =>
			this.loadInstrument(drumset[instrument], basePath)
		);

		await Promise.all(loadingPromises);

		// for (const instrumentName of allDrums) {
		// 	const instrument = drumset[instrumentName];
		// 	console.log(instrument);
		// 	this.playInstrument(instrument, this.audioCtx.currentTime, 1);
		// }

		Store.setAudioState("drumset", drumset);
	}

	private async loadInstrument(
		instrument: Types.IDrumInstrument,
		basePath: string
	): Promise<void> {
		const result = await fetch(basePath + instrument.url);
		const buffer = await result.arrayBuffer();
		const decoded = await this.audioCtx.decodeAudioData(buffer);
		instrument.audioBuffer = decoded;
	}

	private playInstrument(
		instrument: Types.IDrumInstrument,
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
	private tOld: number;
	private handleTimeoutLoopUpdate: number;
	private tPassed: number;
	private handleTimeoutMeasureInCurrentTempo: number;

	private debugPianoRoll: Record<string, number[]>;

	public startLoop(): void {
		const audioState = Store.getState().audio;

		const bpm = audioState.bpm;
		const bps = bpm / 60;
		const tLui = LOOP_UPDATE_INTERVAL / bps;
		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;

		this.debugPianoRoll = {};
		for (const instrKey of Types.DrumsetKeyArray) {
			const dl = dLoop.textBeats[instrKey];
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
		this.tOld = this.audioCtx.currentTime - tLui;
		this.currentPosition = 0;

		this.loop();

		Store.setAudioState("isPlaying", true);
	}

	public stopLoop(): void {
		this.masterGainNode.gain.setValueAtTime(0, 0);
		clearTimeout(this.handleTimeoutLoopUpdate);
		clearTimeout(this.handleTimeoutMeasureInCurrentTempo);
		Store.setAudioState("measuresInCurrentTempo", 0);
		Store.setAudioState("isPlaying", false);
	}

	private currentPosition: number;

	public compile(): void {
		const audioState = Store.getState().audio;

		const drumLoop = audioState.drumLoop;
		const drumSet = audioState.drumset;

		for (const instrKey of Types.DrumsetKeyArray) {
			const dl = drumLoop.textBeats[instrKey];
			const instrument = drumSet[instrKey];
			if (!dl || !instrument) {
				continue;
			}
			drumLoop.compiledBeats[instrKey] = [];

			for (let beatIdx = 0; beatIdx < dl.length; beatIdx++) {
				const beat = dl[beatIdx];
				const compiledBeat: Types.IBeat = { onsets: [] };
				drumLoop.compiledBeats[instrKey].push(compiledBeat);

				for (let digitIdx = 0; digitIdx < beat.length; digitIdx++) {
					const digit = beat[digitIdx];
					const velocity = parseInt(digit, 10) / 9;
					if (isNaN(velocity)) {
						continue;
					}

					const position = beatIdx + digitIdx / beat.length;
					const onset: Types.IOnset = {
						position,
						velocity,
						isPlanned: false,
						subEnumerator: digitIdx,
					};
					compiledBeat.onsets.push(onset);
				}
			}
		}

		Store.setAudioState("drumLoop", drumLoop);
	}

	// https://www.html5rocks.com/en/tutorials/audio/scheduling/

	private loop = () => {
		const tNow = this.audioCtx.currentTime;
		// log("logLoopInterval", now);
		this.tPassed = tNow - this.tOld;
		// log("logLoopInterval", "vergangen " + this.vergangen);
		// log("logLoopInterval", "this.currentPosition " + this.currentPosition);

		const audioState = Store.getState().audio;

		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;
		const bpm = audioState.bpm;
		const bps = bpm / 60;
		const tLui = LOOP_UPDATE_INTERVAL / bps;
		const tOffset = this.tPassed - tLui;

		// const tDeltaNextLoop = 2 * tLui - this.tPassed;
		// log("logLoopInterval", "tDeltaNextLoop " + tDeltaNextLoop);

		let pNext = this.currentPosition + this.tPassed * bps;
		if (pNext + 2 * LOOP_UPDATE_INTERVAL > dLoop.denominator) {
			pNext -= dLoop.denominator;
			// log("logLoopInterval", "newPosition RESET: " + newPosition);

			clearTimeout(this.handleTimeoutMeasureInCurrentTempo);
			this.handleTimeoutMeasureInCurrentTempo = setTimeout(() => {
				Store.setAudioState(
					"measuresInCurrentTempo",
					Store.getState().audio.measuresInCurrentTempo + 1
				);
			}, (-pNext / bps) * 1000);
			// TODO 2020-06-05 wenn kurz vor taktende ein tempowechsel erfolgt, kommt der inkrement zu schnell
		}

		// duration of a quarter note
		const tQuarterNote = 1 / bps;

		const usedInstruments = Object.keys(dLoop.compiledBeats);
		for (const instrKey of usedInstruments) {
			const beats: Types.IBeat[] = dLoop.compiledBeats[instrKey];
			const instrument: Types.IDrumInstrument = dSet[instrKey];

			for (const beat of beats) {
				for (const onset of beat.onsets) {
					if (onset.velocity === 0) {
						continue;
					}
					const tDelta =
						onset.position * tQuarterNote -
						this.currentPosition * tQuarterNote;

					const timeOnset = tNow + tDelta - tOffset;

					if (tDelta >= 0 && tDelta < tLui * 2 && !onset.isPlanned) {
						this.playInstrument(
							instrument,
							timeOnset,
							onset.velocity
						);
						this.debugPianoRoll[instrKey].push(
							timeOnset - this.startTime
						);
						onset.isPlanned = true;
						log("logLoopInterval", "onsetTime " + timeOnset);

						// } else if (delta >= 0 && delta < tLui * 2) {
						// log("logLoopInterval", "already planned: ", onset);

						setTimeout(() => {
							const uiUpdate: Types.IOnsetUIUpdate = {
								enabled: true,
								position: Math.floor(onset.position),
								subEnumerator: onset.subEnumerator,
							};
							const oldHighlighted = Store.getState().ui
								.highlightOnsets;
							Store.setUserInterfaceState("highlightOnsets", {
								...oldHighlighted,
								[instrKey]: uiUpdate,
							});
						}, (tDelta - tOffset) * 1000);
					}

					if (onset.position < this.currentPosition) {
						onset.isPlanned = false;
					}
					if (tDelta > tLui * 2) {
						onset.isPlanned = false;
					}
				}
			}
		}

		this.currentPosition = pNext;

		// log("logLoopInterval", this.debugPianoRoll);

		this.tOld = tNow;

		this.handleTimeoutLoopUpdate = setTimeout(this.loop, tLui * 1000);
	};
}

export const audioManInstance = new AudioMan();
