import { IDebuggingState, getState, setAudioState } from "./store";

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
