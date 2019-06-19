import * as React from "react";

import { audioManInstance, IDrumset } from "./audioMan";

import { PRODUCTION } from "./";

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: BeatronomeApp["props"]) {
		super(props);
		this.state = { masterVolume: 1.0 };

		this.loadDrumset("assets/drumsets/hydro.json");

		// audioManInstance.load({ bd: { url: "assets/drumsets/hydro/bd.mp3" } });
	}

	private async loadDrumset(url: string): Promise<void> {
		const basePath = url.substring(0, url.lastIndexOf("/") + 1);
		const rawJson = await fetch(url);
		const drumset = (await rawJson.json()) as IDrumset;
		audioManInstance.load(drumset, basePath);
	}

	public render() {
		return (
			<div>
				<div>Yeah{PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}</div>
				<div>
					<input
						type="range"
						value={this.state.masterVolume * 1000.0}
						min={0}
						max={1000}
						onChange={e => {
							const vol = e.target.valueAsNumber / 1000;
							this.setState({ masterVolume: vol });
							audioManInstance.gainNode.gain.setValueAtTime(
								e.target.valueAsNumber / 1000,
								0
							);
						}}
					></input>
				</div>
			</div>
		);
	}
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {
	masterVolume: number;
}
