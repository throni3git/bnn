import {
	AudioContext,
	IGainNode,
	IAudioContext,
} from "standardized-audio-context";

import {
	IDrumInstrument,
	IDrumset,
	DrumsetKeys,
	DrumsetKeyArray,
	IOnset,
	IDivision,
	IOnsetUIUpdate,
} from "./types";
import { log } from "./util";
import {
	getState,
	setAudioState,
	LOOP_UPDATE_INTERVAL,
	setUserInterfaceState,
} from "./store";

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
		const loadingPromises = allDrums.map((instrument) =>
			this.loadInstrument(drumset[instrument], basePath)
		);

		await Promise.all(loadingPromises);

		// for (const instrumentName of allDrums) {
		// 	const instrument = drumset[instrumentName];
		// 	console.log(instrument);
		// 	this.playInstrument(instrument, this.audioCtx.currentTime, 1);
		// }

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
	private tOld: number;
	private handleTimeoutLoopUpdate: number;
	private tPassed: number;
	private handleTimeoutMeasureInCurrentTempo: number;

	private debugPianoRoll: Record<string, number[]>;

	public startLoop(): void {
		const audioState = getState().audio;

		const bpm = audioState.bpm;
		const bps = bpm / 60;
		const tLui = LOOP_UPDATE_INTERVAL / bps;
		const dLoop = audioState.drumLoop;
		const dSet = audioState.drumset;

		this.debugPianoRoll = {};
		for (const instrKey of DrumsetKeyArray) {
			const dl = dLoop.textMeasures[instrKey];
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

		setAudioState("isPlaying", true);
	}

	public stopLoop(): void {
		this.masterGainNode.gain.setValueAtTime(0, 0);
		clearTimeout(this.handleTimeoutLoopUpdate);
		clearTimeout(this.handleTimeoutMeasureInCurrentTempo);
		setAudioState("measuresInCurrentTempo", 0);
		setAudioState("isPlaying", false);
	}

	private currentPosition: number;

	public compile(): void {
		const audioState = getState().audio;

		const drumLoop = audioState.drumLoop;
		const drumSet = audioState.drumset;

		for (const instrKey of DrumsetKeyArray) {
			const dl = drumLoop.textMeasures[instrKey];
			const instrument = drumSet[instrKey];
			if (!dl || !instrument) {
				continue;
			}
			drumLoop.compiledMeasure[instrKey] = [];
			drumLoop.metaMeasure[instrKey] = [];

			for (let pIdx = 0; pIdx < dl.length; pIdx++) {
				const part = dl[pIdx];

				let maxSubDenominator = drumLoop.denominator == 4 ? 4 : 2;

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
						isPlanned: false,
						subEnumerator: dIdx,
					};
					drumLoop.compiledMeasure[instrKey].push(onset);

					if (dIdx > maxSubDenominator) {
						maxSubDenominator = dIdx;
					}
				}

				const subDivisions = Array.from({
					length: maxSubDenominator,
				}).map((_, i) => i);
				const division: IDivision = {
					subDenominatorArray: subDivisions,
				};
				drumLoop.metaMeasure[instrKey].push(division);
			}
		}

		setAudioState("drumLoop", drumLoop);
	}

	// https://www.html5rocks.com/en/tutorials/audio/scheduling/

	private loop = () => {
		const tNow = this.audioCtx.currentTime;
		// log("logLoopInterval", now);
		this.tPassed = tNow - this.tOld;
		// log("logLoopInterval", "vergangen " + this.vergangen);
		// log("logLoopInterval", "this.currentPosition " + this.currentPosition);

		const audioState = getState().audio;

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
				setAudioState(
					"measuresInCurrentTempo",
					getState().audio.measuresInCurrentTempo + 1
				);
			}, (-pNext / bps) * 1000);
			// TODO 2020-06-05 wenn kurz vor taktende ein tempowechsel erfolgt, kommt der inkrement zu schnell
		}

		// duration of a quarter note
		const tQuarterNote = 1 / bps;

		const usedInstruments = Object.keys(dLoop.compiledMeasure);
		for (const instrKey of usedInstruments) {
			const onsets = dLoop.compiledMeasure[instrKey] as IOnset[];
			const instrument = dSet[instrKey] as IDrumInstrument;

			for (const onset of onsets) {
				const tDelta =
					onset.position * tQuarterNote -
					this.currentPosition * tQuarterNote;

				const timeOnset = tNow + tDelta - tOffset;

				if (tDelta >= 0 && tDelta < tLui * 2 && !onset.isPlanned) {
					this.playInstrument(instrument, timeOnset, onset.velocity);
					this.debugPianoRoll[instrKey].push(
						timeOnset - this.startTime
					);
					onset.isPlanned = true;
					log("logLoopInterval", "onsetTime " + timeOnset);

					// } else if (delta >= 0 && delta < tLui * 2) {
					// log("logLoopInterval", "already planned: ", onset);

					const now = Date.now();
					const delta = tDelta - tOffset * 1000 - now;
					console.log((tDelta - tOffset) * 1000, now, delta);
					setTimeout(() => {
						console.log("RUN ausgeführt");
						const uiUpdate: IOnsetUIUpdate = {
							enabled: true,
							position: Math.floor(onset.position),
							subEnumerator: onset.subEnumerator,
						};
						const oldHighlighted = getState().ui.highlightOnsets;
						setUserInterfaceState("highlightOnsets", {
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
			// break;
		}

		this.currentPosition = pNext;

		// log("logLoopInterval", this.debugPianoRoll);

		this.tOld = tNow;

		this.handleTimeoutLoopUpdate = setTimeout(this.loop, tLui * 1000);
	};
}

export const audioManInstance = new AudioMan();
