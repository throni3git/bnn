import { PRODUCTION } from ".";
import { IDrumLoop, IDrumset } from "./types";

export const LOOP_UPDATE_INTERVAL = 0.1;

export interface IAudioState {
	masterVolume: number;
	drumLoop: IDrumLoop;
	drumset: IDrumset;
	bpm: number;
	maxBpm: number;
	minBpm: number;
	stepBpm: number;
	availableDrumsets: string[];
	isPlaying: boolean;
}

export interface IUserInterfaceState {
	isWidthLT640Px: boolean;
	isHeightLT640px: boolean;
	isLandscapeMode: boolean;
}

export interface IDebuggingState {
	logDrumLoopParsing: boolean;
	logLoopInterval: boolean;
	logTapTempo: boolean;
}

export interface IState {
	ui: IUserInterfaceState;
	debugging: IDebuggingState;
	audio: IAudioState;
}

const widthLT640Px = screen.width < 640;
const heightLT640px = screen.height < 640;
const isLandscapeMode = Math.abs(screen.orientation.angle) === 90;

let currentState: IState = {
	audio: {
		masterVolume: PRODUCTION ? 1 : 0.3,
		drumLoop: null,
		bpm: 60,
		maxBpm: 200,
		minBpm: 40,
		stepBpm: 4,
		drumset: null,
		availableDrumsets: [],
		isPlaying: false
	},
	debugging: {
		logDrumLoopParsing: !PRODUCTION && false,
		logLoopInterval: !PRODUCTION,
		logTapTempo: !PRODUCTION && false
	},
	ui: { isWidthLT640Px: widthLT640Px, isHeightLT640px: heightLT640px, isLandscapeMode }
};

// orientation and resize handlers
window.addEventListener("resize", (event: UIEvent) => {
	const widthLT640Px = screen.width < 640;
	const heightLT640px = screen.height < 640;
	const state = getState();

	if (state.ui.isWidthLT640Px != widthLT640Px) {
		setUserInterfaceState("isWidthLT640Px", widthLT640Px);
	}
	if (state.ui.isHeightLT640px != heightLT640px) {
		setUserInterfaceState("isHeightLT640px", heightLT640px);
	}
});

window.addEventListener("orientationchange", (event: UIEvent) => {
	if (Math.abs(screen.orientation.angle) === 90) {
		setUserInterfaceState("isLandscapeMode", true);
	} else {
		setUserInterfaceState("isLandscapeMode", false);
	}
});

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
