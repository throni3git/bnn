import { PRODUCTION } from ".";

export interface IUserInterfaceState {
	masterVolume: number;
}

export interface IDebuggingState {}

export interface IState {
	ui: IUserInterfaceState;
	debugging: IDebuggingState;
}

let currentState: IState = {
	ui: { masterVolume: PRODUCTION ? 1 : 0 },
	debugging: {}
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
