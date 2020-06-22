import * as React from "react";

import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PRODUCTION } from "./";
import {
	subscribe,
	getState,
	setAudioState,
	setUserInterfaceState,
	EDeviceMode
} from "./store";
import { IDrumset, DrumsetKeyArray, IDrumLoop } from "./types";
import { audioManInstance } from "./audioMan";
import {
	log,
	increaseBpm,
	decreaseBpm,
	tapTempo,
	togglePlay,
	setMasterVolume
} from "./util";
import Button from "./button";
import { DIR_DRUMSETS, DIR_LOOPS } from "./constants";

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;

// const ContainerDiv = styled.div<{ isLandscapeMode: boolean }>(
// 	(props) => `
// 	font-family: sans-serif;
// 	// display:flex;
// 	// flex-direction: ${props.isLandscapeMode ? "row" : "column"}
// 	`
// );

const AllDiv = styled.div`
	display: flex;
	overflow: hidden;
	flex-direction: column;
	max-height: 800px;
	max-width: 800px;
	width: 100%;
	height: 100%;
`;

const ContainerDiv = styled.div`
	font-family: sans-serif;
	display: flex;
	flex-direction: column;
	flex: 1;
	justify-content: space-evenly;
`;

const SliderCaptionDiv = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 3px;
`;

const SliderDiv = styled.div`
	display: flex;
`;

const Row = styled.div`
	display: flex;
	flex-direction: row;
	/* justify-content: center; */
	justify-content: space-evenly;
`;

const Heading = styled.div`
	font-size: 1.2em;
	font-weight: bold;
	justify-content: center;
	text-align: center;
	padding: 12px;
`;

const Column = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: center;
`;

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

	public componentDidMount() {
		// assign handlers to window
		window.addEventListener("resize", this.responsiveDesignHandler);
		window.addEventListener(
			"orientationchange",
			this.responsiveDesignHandler
		);

		// initially call handlers to start correctly
		this.responsiveDesignHandler();
	}

	/**
	 * handler for orientation change and resize events
	 */
	private responsiveDesignHandler = (event?: UIEvent) => {
		const landscapeOrientation = Math.abs(screen.orientation.angle) === 90;
		const width = window.innerWidth;
		const height = window.innerHeight;
		let newMode: EDeviceMode = null;

		if (width > 1024 && height > 768) {
			newMode = EDeviceMode.Desktop;
		} else if (landscapeOrientation && width > 640) {
			newMode = EDeviceMode.BigLandscape;
		} else if (!landscapeOrientation && height > 640) {
			newMode = EDeviceMode.BigPortrait;
		} else if (landscapeOrientation && width <= 640) {
			newMode = EDeviceMode.SmallLandscape;
		} else {
			newMode = EDeviceMode.SmallPortrait;
		}

		const uiState = getState().ui;

		if (uiState.deviceMode !== newMode) {
			console.log(newMode);
			setUserInterfaceState("deviceMode", newMode);
		}
	};

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
				const instrKey = DrumsetKeyArray.find((key) =>
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
					if (singleMeters.some((meter) => meterRegEx.test(meter))) {
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
		const timer = new Date(audioState.timer * 1000);
		const minutes = (new Array(2).join("0") + timer.getMinutes()).slice(-2);
		const seconds = (new Array(2).join("0") + timer.getSeconds()).slice(-2);
		const timerString = `${minutes}:${seconds}`;
		const measuresInCurrentTempo = Math.max(
			audioState.measuresInCurrentTempo,
			0
		);

		const iconSize = "2x";

		return (
			<AllDiv>
				<Heading>BEATRONOME</Heading>
				<ContainerDiv>
					<Row>
						<Column>
							<SliderCaptionDiv>
								<span>Volume</span>
								<span>
									{audioState.masterVolume.toFixed(2)}
								</span>
							</SliderCaptionDiv>
							<SliderDiv>
								<input
									type="range"
									value={audioState.masterVolume * 1000.0}
									min={0}
									max={1000}
									onChange={(e) => {
										const vol =
											e.target.valueAsNumber / 1000;
										setMasterVolume(vol);
									}}
									style={{ width: "100%" }}
								></input>
							</SliderDiv>
						</Column>
					</Row>
					<Row>
						<Column>
							<Button action={increaseBpm}>
								<FontAwesomeIcon
									size={iconSize}
									icon="plus-circle"
								></FontAwesomeIcon>
							</Button>
						</Column>
						<Column>
							<Button action={decreaseBpm}>
								<FontAwesomeIcon
									size={iconSize}
									icon="minus-circle"
								></FontAwesomeIcon>
							</Button>
						</Column>
					</Row>
					<Row>
						<Column>
							<Button action={tapTempo}>
								<FontAwesomeIcon
									size={iconSize}
									icon="hand-point-up"
								></FontAwesomeIcon>
							</Button>
						</Column>
					</Row>
					<Row>
						<Column>
							<SliderCaptionDiv>
								{audioState.bpm + " BPM"}
							</SliderCaptionDiv>
							<SliderDiv>
								<input
									type="range"
									value={audioState.bpm}
									min={audioState.minBpm}
									max={audioState.maxBpm}
									onChange={this.changeTempo}
									style={{ width: "100%" }}
								></input>
							</SliderDiv>
						</Column>
					</Row>
					<Row>
						<Column>Timer: {timerString}</Column>
						<Column>
							<Button action={() => togglePlay()}>
								{audioState.isPlaying ? (
									<FontAwesomeIcon
										size={iconSize}
										icon="stop-circle"
									></FontAwesomeIcon>
								) : (
									<FontAwesomeIcon
										size={iconSize}
										icon="play-circle"
									></FontAwesomeIcon>
								)}
							</Button>
						</Column>
						<Column>
							{measuresInCurrentTempo} measures in current tempo
						</Column>
					</Row>
				</ContainerDiv>
			</AllDiv>
		);
	}

	/**
	 * callback setting up state for new tempo
	 */
	private changeTempo = (e: React.ChangeEvent<HTMLInputElement>) => {
		const bpm = e.target.valueAsNumber;
		console.log(bpm);

		setAudioState("measuresInCurrentTempo", -1);
		setAudioState("bpm", bpm);
	};
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
