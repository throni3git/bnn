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
import { log, increaseBpm, decreaseBpm } from "./util";
import Button from "./button";
import { DIR_DRUMSETS, DIR_LOOPS } from "./constants";

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: BeatronomeApp["props"]) {
		super(props);

		subscribe(() => this.setState({}));

		this.initialize();
	}

	private async initialize(): Promise<void> {
		await this.loadDrumsetIndex();

		this.loadDrumset(getState().audio.availableDrumsets[0]);

		if (PRODUCTION) {
			this.loadDrumloop("straight44.txt");
		} else {
			this.loadDrumloop("debug.txt");
		}
	}

	/**
	 * get overview of drumsets available
	 * @param url
	 */
	private async loadDrumsetIndex(): Promise<void> {
		const rawJson = await fetch(DIR_DRUMSETS + "index.json");
		const overview = (await rawJson.json()) as { entries: Array<string> };
		setAudioState("availableDrumsets", overview.entries);
	}

	/**
	 * prepare drumset and set it as current
	 * @param url
	 */
	private async loadDrumset(name: string): Promise<void> {
		const rawJson = await fetch(DIR_DRUMSETS + name);
		const drumset = (await rawJson.json()) as IDrumset;
		audioManInstance.loadDrumset(drumset, DIR_DRUMSETS);
	}

	/**
	 * parse drumloop from text file
	 * @param url
	 */
	private async loadDrumloop(name: string): Promise<void> {
		const rawText = await fetch(DIR_LOOPS + name);
		const text = await rawText.text();
		const lines = text.split("\n");
		const drumloop: IDrumLoop = {
			denominator: 4,
			enumerator: 4,
			measure: {},
			compiledMeasure: {}
		};

		for (const line of lines) {
			log("logDrumLoopParsing", line);

			// set time signature
			// e.g.: time[4/4]
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
				// e.g.: hhc......[9 6 |8 6 |9 6 |8 6 ]
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
		const audioState = getState().audio;

		return (
			<div>
				<div>
					<h1 style={{ textAlign: "center" }}>
						BEATRONOME{PRODUCTION ? "" : " (development)"}
					</h1>
				</div>
				<div>
					<span>Volume</span>
					<input
						type="range"
						value={audioState.masterVolume * 1000.0}
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
					<span>{audioState.masterVolume}</span>
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
				<div>
					<Button
						caption={"Increase " + audioState.stepBpm + " bpm"}
						action={increaseBpm}
					></Button>
					<Button
						caption={"Decrease " + audioState.stepBpm + " bpm"}
						action={decreaseBpm}
					></Button>
				</div>
				<div>
					<span>Tempo</span>
					<input
						type="range"
						value={getState().audio.bpm}
						min={40}
						max={200}
						onChange={this.changeTempo}
					></input>
					<span>{"" + audioState.bpm + " BPM"}</span>
				</div>
			</div>
		);
	}

	/**
	 * callback setting up state for new tempo
	 */
	private changeTempo = (e: React.ChangeEvent<HTMLInputElement>) => {
		const now = Date.now();
		const bpm = e.target.valueAsNumber;
		console.log(bpm);

		setAudioState("bpm", bpm);
	};
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
