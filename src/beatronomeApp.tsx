import * as React from "react";

import { PRODUCTION } from "./";
import { subscribe, setUserInterfaceState, getState } from "./store";
import { IDrumset, DrumsetKeys, DrumsetKeyArray, IDrumLoop } from "./types";
import { audioManInstance } from "./audioMan";
import { log } from "./util";

const bracketsRegEx = /\[[^\]]*\]/;

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: BeatronomeApp["props"]) {
		super(props);

		subscribe(() => this.setState({}));

		this.loadDrumset("assets/drumsets/hydro.json");

		this.loadDrumloop("assets/loops/straight44.txt");
	}

	private async loadDrumset(url: string): Promise<void> {
		const basePath = url.substring(0, url.lastIndexOf("/") + 1);
		const rawJson = await fetch(url);
		const drumset = (await rawJson.json()) as IDrumset;
		audioManInstance.loadDrumset(drumset, basePath);
	}

	private async loadDrumloop(url: string): Promise<void> {
		const rawText = await fetch(url);
		const text = await rawText.text();
		const lines = text.split("\n");
		const drumloop: IDrumLoop = {
			denominator: 4,
			enumerator: 4,
			measure: {}
		};

		for (const line of lines) {
			log("logDrumLoopParsing", line);

			if (line.startsWith("time")) {
				const time = bracketsRegEx.exec(line);
				if (time && time[0]) {
					const ts = time[0].substring(1, time[0].length - 1);
					const tsSplit = ts.split("/");
					drumloop.enumerator = parseInt(tsSplit[0], 10);
					drumloop.denominator = parseInt(tsSplit[1], 10);
					log(
						"logDrumLoopParsing",
						"time signature found: " + tsSplit
					);
				}
			} else {
				// check if an instrument is referenced
				const instrKey = DrumsetKeyArray.find(key =>
					line.startsWith(key)
				);
				if (instrKey) {
					const drumLine = bracketsRegEx.exec(line);
					log("logDrumLoopParsing", drumLine);
					if (drumLine && drumLine[0]) {
						log(
							"logDrumLoopParsing",
							"drumLine [" + instrKey + "] found: " + drumLine[0]
						);
						drumloop.measure[instrKey] = drumLine[0];
					}
				}
			}
		}

		log("logDrumLoopParsing", drumloop);
	}

	public render() {
		return (
			<div>
				<div>Yeah{PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}</div>
				<div>
					<input
						type="range"
						value={getState().ui.masterVolume * 1000.0}
						min={0}
						max={1000}
						onChange={e => {
							const vol = e.target.valueAsNumber / 1000;
							setUserInterfaceState("masterVolume", vol);
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

interface IBeatronomeAppState {}
