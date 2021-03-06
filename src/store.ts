declare var IS_PRODUCTION: boolean;

import * as Types from "./types";

export interface IAudioState {
	masterVolume: number;
	drumLoop: Types.IDrumLoop;
	rawDrumLoopText: string;
	drumset: Types.IDrumset;
	bpm: number;
	maxBpm: number;
	minBpm: number;
	stepBpm: number;
	availableDrumsets: string[];
	isPlaying: boolean;
	timer: number;
	measuresInCurrentTempo: number;
}

export interface IUserInterfaceState {
	deviceMode: Types.EDeviceMode;
	highlightOnsets: Record<Types.DrumsetKeys, Types.IOnsetUIUpdate>;
	displayMode: Types.EDisplayMode;
}

export interface IDebuggingState {
	logDrumLoopParsing: boolean;
	logLoopInterval: boolean;
	logTapTempo: boolean;
	logDeviceOrientation: boolean;
}

export interface IState {
	ui: IUserInterfaceState;
	debugging: IDebuggingState;
	audio: IAudioState;
}

export function getEmptyHighlightOnsetsObject() {
	return {
		// eleganter gehts shcon noch
		bd: { enabled: false, position: 0, subEnumerator: 0 },
		hho: { enabled: false, position: 0, subEnumerator: 0 },
		hhc: { enabled: false, position: 0, subEnumerator: 0 },
		sn: { enabled: false, position: 0, subEnumerator: 0 },
		tomHi: { enabled: false, position: 0, subEnumerator: 0 },
		tomMidHi: { enabled: false, position: 0, subEnumerator: 0 },
		tomMidLo: { enabled: false, position: 0, subEnumerator: 0 },
		tomLo: { enabled: false, position: 0, subEnumerator: 0 },
	}
}

let currentState: IState = {
	audio: {
		masterVolume: IS_PRODUCTION ? 1 : 0.3,
		drumLoop: null,
		bpm: 60,
		maxBpm: 200,
		minBpm: 40,
		stepBpm: 4,
		drumset: null,
		availableDrumsets: [],
		isPlaying: false,
		timer: 0,
		measuresInCurrentTempo: 0,
		rawDrumLoopText: "",
	},
	debugging: {
		logDrumLoopParsing: !IS_PRODUCTION && false,
		logLoopInterval: !IS_PRODUCTION,
		logTapTempo: !IS_PRODUCTION && false,
		logDeviceOrientation: !IS_PRODUCTION,
	},
	ui: {
		deviceMode: Types.EDeviceMode.Desktop,
		displayMode: Types.EDisplayMode.Play,
		highlightOnsets: getEmptyHighlightOnsetsObject(),
	},
};

export const getState = () => currentState;

// assign State to window object
Object.defineProperty(window, "BNState", {
	get: () => {
		return getState();
	},
});

// state and sub state setters
export const setState = <K extends keyof IState>(key: K, value: IState[K]) => {
	currentState = {
		...currentState,
		[key]: value,
	};
	update();
};

export const setAudioState = <K extends keyof IAudioState>(
	key: K,
	value: IAudioState[K]
) => {
	setState("audio", {
		...currentState.audio,
		[key]: value,
	});
};

export const setUserInterfaceState = <K extends keyof IUserInterfaceState>(
	key: K,
	value: IUserInterfaceState[K]
) => {
	setState("ui", {
		...currentState.ui,
		[key]: value,
	});
};

export const setDebuggingState = <K extends keyof IDebuggingState>(
	key: K,
	value: IDebuggingState[K]
) => {
	setState("debugging", {
		...currentState.debugging,
		[key]: value,
	});
};

// Subscription functions
export type Subscriber = () => void;

const subscribers: Subscriber[] = [];

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
