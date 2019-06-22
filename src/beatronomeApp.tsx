import * as React from "react";

import { PRODUCTION } from "./";
import {
	subscribe,
	setUserInterfaceState,
	getState,
	setAudioState
} from "./store";
import { IDrumset, DrumsetKeys, DrumsetKeyArray, IDrumLoop } from "./types";
import { audioManInstance } from "./audioMan";
import { log } from "./util";
import Button from "./button";

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: BeatronomeApp["props"]) {
		super(props);

		subscribe(() => this.setState({}));

		this.loadDrumset("assets/drumsets/hydro.json");

		if (!PRODUCTION) {
			this.loadDrumloop("assets/loops/straight44.txt");
		} else {
			this.loadDrumloop("assets/loops/debug.txt");
		}
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
				const drumLine = bracketsRegEx.exec(line);

				if (instrKey && drumLine && drumLine[0]) {
					log("logDrumLoopParsing", drumLine);
					log(
						"logDrumLoopParsing",
						"drumLine [" + instrKey + "] found: " + drumLine[0]
					);

					// only take drum lines that have notes
					const dl = drumLine[0].substring(1, drumLine[0].length - 1);
					const singleMeters = dl.split("|");
					if (singleMeters.some(meter => meterRegEx.test(meter))) {
						drumloop.measure[instrKey] = singleMeters;
					}
				}
			}
		}

		log("logDrumLoopParsing", drumloop);

		setAudioState("drumLoop", drumloop);
	}

	public render() {
		return (
			<div>
				<div>Yeah{PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}</div>
				<div>
					<input
						type="range"
						value={getState().audio.masterVolume * 1000.0}
						min={0}
						max={1000}
						onChange={e => {
							const vol = e.target.valueAsNumber / 1000;
							setAudioState("masterVolume", vol);
							audioManInstance.masterGainNode.gain.setValueAtTime(
								e.target.valueAsNumber / 1000,
								0
							);
						}}
					></input>
				</div>
				<div>
					<Button
						caption="StartLoop"
						action={() => audioManInstance.startLoop()}
					></Button>
					<Button
						caption="StopLoop"
						action={() => audioManInstance.stopLoop()}
					></Button>
				</div>
			</div>
		);
	}
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
