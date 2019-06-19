import * as React from "react";
import { oscillatorNode } from "./audioMan";

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: BeatronomeApp["props"]) {
		super(props);

		oscillatorNode.start();
	}

	public render() {
		return <div>Yeah</div>;
	}
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
