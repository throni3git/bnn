import { IDebuggingState, getState, setAudioState } from "./store";
import { audioManInstance } from "./audioMan";

export function log(key: keyof IDebuggingState, ...args): void {
	const state = getState();
	if (state.debugging[key]) {
		console.log(...args);
	}
}

/** increase tempo by x bpm */
export function increaseBpm(): void {
	const audioState = getState().audio;
	const bpm = Math.min(
		audioState.maxBpm,
		audioState.bpm + audioState.stepBpm
	);

	if (bpm !== audioState.bpm) {
		setAudioState("measuresInCurrentTempo", -1);
		setAudioState("bpm", bpm);
	}
}

/** decrease tempo by x bpm */
export function decreaseBpm(): void {
	const audioState = getState().audio;
	const bpm = Math.max(
		audioState.minBpm,
		audioState.bpm - audioState.stepBpm
	);

	if (bpm !== audioState.bpm) {
		setAudioState("measuresInCurrentTempo", -1);
		setAudioState("bpm", bpm);
	}
}

/** tap tempo and get BPM value for the last 3 taps */
let lastTapTempo = 0;
let tapTimings = new Array<number>();
export function tapTempo(): void {
	const now = Date.now();
	const delta = now - lastTapTempo;
	lastTapTempo = now;

	// reset
	if (delta > 2000) {
		tapTimings = new Array<number>();
	}

	tapTimings.push(delta);
	if (tapTimings.length < 3) {
		return;
	}

	// cycle through delta time values, drop oldest value
	tapTimings.shift();

	// calculate mean value
	let meanDelta = 0;
	for (const partDelta of tapTimings) {
		meanDelta += partDelta;
	}
	meanDelta /= tapTimings.length;
	console.group("tapTempo");
	log("logTapTempo", "tapTimings", tapTimings);
	log("logTapTempo", "meanDelta", meanDelta);

	// update state
	const audioState = getState().audio;
	let bpm = Math.round((60 * 1000) / meanDelta);
	bpm = Math.min(audioState.maxBpm, bpm);
	bpm = Math.max(audioState.minBpm, bpm);
	log("logTapTempo", "bpm", bpm);
	console.groupEnd();

	setAudioState("measuresInCurrentTempo", -1);
	setAudioState("bpm", bpm);
}

/** toggle playback state */
let timerIntervalHandle = null;
export function togglePlay(): void {
	if (getState().audio.isPlaying) {
		audioManInstance.stopLoop();

		clearInterval(timerIntervalHandle);
		timerIntervalHandle = null;
	} else {
		audioManInstance.startLoop();

		timerIntervalHandle = setInterval(
			() => setAudioState("timer", getState().audio.timer + 1),
			1000
		);
	}
}

/** set volume */
export function setMasterVolume(vol: number): void {
	setAudioState("masterVolume", vol);
	audioManInstance.masterGainNode.gain.setValueAtTime(vol, 0);
}

/** increase volume by 0.05 */
export function increaseVolume(): void {
	let vol = getState().audio.masterVolume;
	vol = Math.min(vol + 0.05, 1.0);
	setMasterVolume(vol);
}

/** decrease volume by 0.05 */
export function decreaseVolume(): void {
	let vol = getState().audio.masterVolume;
	vol = Math.max(vol - 0.05, 0.0);
	setMasterVolume(vol);
}
