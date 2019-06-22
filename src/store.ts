import { PRODUCTION } from ".";
import { IDrumLoop, IDrumset } from "./types";

export interface IAudioState {
	masterVolume: number;
	drumLoop: IDrumLoop;
	drumset: IDrumset;
	bpm: number;
	loopUpdateInterval: number;
}

export interface IUserInterfaceState {}

export interface IDebuggingState {
	logDrumLoopParsing: boolean;
	logLoopInterval: boolean;
}

export interface IState {
	ui: IUserInterfaceState;
	debugging: IDebuggingState;
	audio: IAudioState;
}

let currentState: IState = {
	audio: {
		masterVolume: PRODUCTION ? 1 : 0.3,
		drumLoop: null,
		bpm: 60,
		loopUpdateInterval: 1.0,
		drumset: null
	},
	debugging: {
		logDrumLoopParsing: !PRODUCTION && false,
		logLoopInterval: !PRODUCTION
	},
	ui: {}
};

export type Subscriber = () => void;

const subscribers: Subscriber[] = [];

export const getState = () => currentState;

Object.defineProperty(window, "BNState", {
	get: () => {
		return getState();
	}
});

export const setState = <K extends keyof IState>(key: K, value: IState[K]) => {
	currentState = {
		...currentState,
		[key]: value
	};
	update();
};

export const setAudioState = <K extends keyof IAudioState>(
	key: K,
	value: IAudioState[K]
) => {
	setState("audio", {
		...currentState.audio,
		[key]: value
	});
};

export const setUserInterfaceState = <K extends keyof IUserInterfaceState>(
	key: K,
	value: IUserInterfaceState[K]
) => {
	setState("ui", {
		...currentState.ui,
		[key]: value
	});
};

export const setDebuggingState = <K extends keyof IDebuggingState>(
	key: K,
	value: IDebuggingState[K]
) => {
	setState("debugging", {
		...currentState.debugging,
		[key]: value
	});
};

export const subscribe = (cb: Subscriber) => {
	subscribers.push(cb);

	return () => {
		const index = subscribers.indexOf(cb);

		if (index > -1) {
			subscribers.splice(index, 1);
		}
	};
};

const update = () => {
	for (const subscription of subscribers) {
		subscription();
	}
};
