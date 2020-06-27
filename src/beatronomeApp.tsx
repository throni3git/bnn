import * as React from "react";

import styled from "styled-components";
import { Range, Direction } from "react-range";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

declare var IS_PRODUCTION: boolean;
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
	setMasterVolume,
	resetTimerIfStopped
} from "./util";
import Button from "./button";
import { DIR_DRUMSETS, DIR_LOOPS, COLORS } from "./constants";

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;

const AllDiv = styled.div`
	display: flex;
	overflow: hidden;
	flex-direction: column;
	max-height: 800px;
	max-width: 800px;
	width: 100%;
	height: 100%;
`;

const Heading = styled.div`
	font-size: 2em;
	font-weight: bold;
	justify-content: center;
	text-align: center;
	padding-top: 8px;
`;

const ContainerDiv = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	justify-content: space-evenly;
	padding: 8px;
`;

// TODO löschen
const SliderCaptionDiv = styled.div`
	display: flex;
	justify-content: center;
	/* padding: 3px; */
`;

const SliderRow = styled.div`
	display: flex;
	padding: 10px;
`;

const FlexRow = styled.div`
	/* border: 1px dotted red; */
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: center;
`;

const Row = styled.div`
	/* border: 1px dotted red; */
	display: flex;
	/* flex: 1; */
	flex-direction: row;
	justify-content: space-evenly;
`;

const FixedRow = styled.div`
	/* border: 1px dotted darkred; */
	/* min-height: 40px; */
	display: flex;
`;

const Column = styled.div`
	/* border: 1px dotted green; */
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: center;
`;

const FixedColumn = styled.div`
	/* border: 1px dotted darkgreen; */
	display: flex;
	width: 62px;
	flex-direction: column;
	justify-content: center;
`;

const RangeTrackHorizontal = styled.div`
	background-color: ${COLORS.light};
	border: 1px solid ${COLORS.lightBorder};
	height: 20px;
	width: 100%;
	margin: auto;
`;

const RangeTrackVertical = styled.div`
	background-color: ${COLORS.light};
	border: 1px solid ${COLORS.lightBorder};
	height: 100%;
	width: 20px;
	margin: auto;
`;

const RangeThumb = styled.div`
	height: 20px;
	width: 20px;
	background-color: ${COLORS.fc};
	&:focus {
		outline: none;
	}
`;

const CenteredSmall = styled.div`
	font-size: 0.7em;
	text-align: center;
`;

const CenteredLarge = styled.div`
	font-size: 2em;
	font-weight: bold;
	text-align: center;
`;

const ResetButton = styled.div<{ isDisabled: boolean }>(
	(props) => `
	position:absolute;
	cursor:pointer;
	color: ${props.isDisabled ? COLORS.light : COLORS.fc};
`
);

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

		if (IS_PRODUCTION) {
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
			if (getState().debugging.logDeviceOrientation) {
				console.log(
					newMode + " (angle " + screen.orientation.angle + ")"
				);
			}
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

		const groupTempoChange: JSX.Element = (
			<FixedColumn>
				<Row>
					<Button action={increaseBpm}>
						<FontAwesomeIcon
							size={iconSize}
							icon="plus-circle"
						></FontAwesomeIcon>
					</Button>
				</Row>
				<Row>
					<Button action={decreaseBpm}>
						<FontAwesomeIcon
							size={iconSize}
							icon="minus-circle"
						></FontAwesomeIcon>
					</Button>
				</Row>
			</FixedColumn>
		);

		const sliderVolume: JSX.Element = (
			<Range
				values={[audioState.masterVolume * 1000.0]}
				min={0}
				max={1000}
				direction={Direction.Up}
				onChange={(values) => {
					const vol = values[0] / 1000;
					setMasterVolume(vol);
				}}
				renderTrack={({ props, children }) => (
					<RangeTrackVertical {...props}>
						{children}
					</RangeTrackVertical>
				)}
				renderThumb={() => <RangeThumb key={1} />}
			></Range>
		);

		const sliderTempo: JSX.Element = (
			<Range
				values={[audioState.bpm]}
				min={audioState.minBpm}
				max={audioState.maxBpm}
				onChange={this.changeTempo}
				renderTrack={({ props, children }) => (
					<RangeTrackHorizontal {...props}>
						{children}
					</RangeTrackHorizontal>
				)}
				renderThumb={() => <RangeThumb key={1} />}
			></Range>
		);

		const groupPlayTimer: JSX.Element = (
			<FixedRow>
				<Column>
					<ResetButton
						isDisabled={
							audioState.isPlaying || audioState.timer < 3
						}
						onClick={() => resetTimerIfStopped()}
					>
						<FontAwesomeIcon icon="undo"></FontAwesomeIcon>
					</ResetButton>
					<CenteredSmall>Timer</CenteredSmall>
					<CenteredLarge>{timerString}</CenteredLarge>
				</Column>
				<FixedColumn>
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
				</FixedColumn>
				<Column>
					<CenteredSmall># in tempo</CenteredSmall>
					<CenteredLarge>{measuresInCurrentTempo}</CenteredLarge>
				</Column>
			</FixedRow>
		);

		return (
			<AllDiv>
				<Heading>BEATRONOME</Heading>
				<ContainerDiv>
					<FlexRow>
						<CenteredSmall>
							FANCY MATRIX WITH DRUM PATTERN
						</CenteredSmall>
					</FlexRow>
					<Row>
						<FixedColumn>
							<Row>
								<CenteredSmall>Volume</CenteredSmall>
							</Row>
							<FlexRow style={{ padding: "10px" }}>
								{sliderVolume}
							</FlexRow>
						</FixedColumn>
						<Column>
							<Row>
								<Button action={tapTempo}>
									<FontAwesomeIcon
										size={iconSize}
										icon="hand-point-up"
									></FontAwesomeIcon>
								</Button>
							</Row>
							<FlexRow>
								<CenteredLarge>
									{audioState.bpm + " BPM"}
								</CenteredLarge>
							</FlexRow>
						</Column>
						{groupTempoChange}
					</Row>
					<SliderRow>{sliderTempo}</SliderRow>
					{groupPlayTimer}
				</ContainerDiv>
			</AllDiv>
		);
	}

	/**
	 * callback setting up state for new tempo
	 */
	private changeTempo = (values: number[]) => {
		const bpm = values[0];
		console.log(bpm);

		setAudioState("measuresInCurrentTempo", -1);
		setAudioState("bpm", bpm);
	};
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
