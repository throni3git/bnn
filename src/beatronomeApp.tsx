import * as React from "react";

import { audioManInstance } from "./audioMan";

import { PRODUCTION } from "./";

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: BeatronomeApp["props"]) {
		super(props);

		audioManInstance.load();
	}

	public render() {
		return <div>Yeah{PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}</div>;
	}
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
