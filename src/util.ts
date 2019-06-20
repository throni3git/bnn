import { IDebuggingState, getState } from "./store";

export function log(key: keyof IDebuggingState, ...args): void {
	const state = getState();
	if (state.debugging[key]) {
		console.log(...args);
	}
}
