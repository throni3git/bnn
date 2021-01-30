import * as Store from "./store";
import { audioManInstance } from "./audioMan";

export function log(key: keyof Store.IDebuggingState, ...args): void {
	const state = Store.getState();
	if (state.debugging[key]) {
		console.log(...args);
	}
}

/** increase tempo by x bpm */
export function increaseBpm(): void {
	const audioState = Store.getState().audio;
	const bpm = Math.min(
		audioState.maxBpm,
		audioState.bpm + audioState.stepBpm
	);

	if (bpm !== audioState.bpm) {
		Store.setAudioState("measuresInCurrentTempo", -1);
		Store.setAudioState("bpm", bpm);
	}
}

/** decrease tempo by x bpm */
export function decreaseBpm(): void {
	const audioState = Store.getState().audio;
	const bpm = Math.max(
		audioState.minBpm,
		audioState.bpm - audioState.stepBpm
	);

	if (bpm !== audioState.bpm) {
		Store.setAudioState("measuresInCurrentTempo", -1);
		Store.setAudioState("bpm", bpm);
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
	const audioState = Store.getState().audio;
	let bpm = Math.round((60 * 1000) / meanDelta);
	bpm = Math.min(audioState.maxBpm, bpm);
	bpm = Math.max(audioState.minBpm, bpm);
	log("logTapTempo", "bpm", bpm);
	console.groupEnd();

	Store.setAudioState("measuresInCurrentTempo", -1);
	Store.setAudioState("bpm", bpm);
}

/** toggle playback state */
let timerIntervalHandle = null;
export function togglePlay(): void {
	if (Store.getState().audio.isPlaying) {
		audioManInstance.stopLoop();

		clearInterval(timerIntervalHandle);
		timerIntervalHandle = null;
	} else {
		audioManInstance.startLoop();

		timerIntervalHandle = setInterval(() => {
			const newTimer = Store.getState().audio.timer + 1;
			Store.setAudioState("timer", newTimer);
		}, 1000);
	}
}

/** set volume */
export function setMasterVolume(vol: number): void {
	Store.setAudioState("masterVolume", vol);
	audioManInstance.masterGainNode.gain.setValueAtTime(vol, 0);
}

/** increase volume by 0.05 */
export function increaseVolume(): void {
	let vol = Store.getState().audio.masterVolume;
	vol = Math.min(vol + 0.05, 1.0);
	setMasterVolume(vol);
}

/** decrease volume by 0.05 */
export function decreaseVolume(): void {
	let vol = Store.getState().audio.masterVolume;
	vol = Math.max(vol - 0.05, 0.0);
	setMasterVolume(vol);
}

/** reset timer and measures in tempo */
export function resetTimerIfStopped(): void {
	if (!Store.getState().audio.isPlaying) {
		Store.setAudioState("timer", 0);
		Store.setAudioState("measuresInCurrentTempo", 0);
	}
}
