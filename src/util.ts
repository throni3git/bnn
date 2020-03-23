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
	setAudioState("bpm", bpm);
}

/** decrease tempo by x bpm */
export function decreaseBpm(): void {
	const audioState = getState().audio;
	const bpm = Math.max(
		audioState.minBpm,
		audioState.bpm - audioState.stepBpm
	);
	setAudioState("bpm", bpm);
}

/** toggle playback state */
export function togglePlay(): void {
	if (getState().audio.isPlaying) {
		audioManInstance.stopLoop();
	} else {
		audioManInstance.startLoop();
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
