import * as React from "react";
import { orientation } from "o9n";

import styled, { createGlobalStyle } from "styled-components";
import { Range, Direction } from "react-range";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const GlobalStyle = createGlobalStyle`
	*, *:before, *:after {
		box-sizing: border-box;
		outline: none;
	}
`;

declare var IS_PRODUCTION: boolean;
import {
	subscribe,
	getState,
	setAudioState,
	setUserInterfaceState,
	EDeviceMode,
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
	resetTimerIfStopped,
} from "./util";
import Button from "./button";
import { DIR_DRUMSETS, DIR_LOOPS, COLORS } from "./constants";
import Matrix from "./matrix";

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;

const AllDiv = styled.div<{ deviceMode: EDeviceMode }>(
	(props) => `
	display: flex;
	overflow: hidden;
	flex-direction: column;
	max-height: 1024px;
	max-width: 1024px;
	width: 100%;
	height: 100%;
	font-size: ${
		props.deviceMode === EDeviceMode.SmallPortrait ||
		props.deviceMode === EDeviceMode.SmallLandscape
			? "0.8em"
			: null
	}
	margin: ${props.deviceMode === EDeviceMode.Desktop ? "auto" : null};
	border: ${
		props.deviceMode === EDeviceMode.Desktop
			? "2px solid " + COLORS.lightBorder
			: null
	};
`
);

const Heading = styled.div`
	font-size: 2em;
	font-weight: bold;
	justify-content: center;
	text-align: center;
	padding-top: 4px;
`;

const ContainerDiv = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	justify-content: space-evenly;
	padding: 4px;
`;

// TODO löschen
const SliderCaptionDiv = styled.div`
	display: flex;
	justify-content: center;
	/* padding: 3px; */
`;

const SliderPadding = styled.div`
	display: flex;
	flex: 1;
	padding: 10px;
`;

const FlexRow = styled.div`
	/* border: 1px dotted red; */
	display: flex;
	flex: 1;
	flex-direction: row;
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

const FixedColumn = styled.div<{ deviceMode: EDeviceMode }>(
	(props) => `
	/* border: 1px dotted darkgreen; */
	display: flex;
	width: ${
		props.deviceMode === EDeviceMode.SmallLandscape ||
		props.deviceMode === EDeviceMode.SmallPortrait
			? "50px"
			: "60px"
	};
	flex-direction: column;
	justify-content: center;
`
);

const RangeTrackHorizontal = styled.div`
	height: 20px;
	width: calc(100% - 20px);
	margin: auto;
	position: relative;

	&::before {
		content: "";
		background-color: ${COLORS.light};
		border: 2px solid ${COLORS.lightBorder};
		display: block;
		width: calc(100% + 20px);
		height: 20px;
		transform: translateX(-10px);
		position: absolute;
	}
`;

const RangeTrackVertical = styled.div`
	height: calc(100% - 20px);
	width: 20px;
	margin: auto;

	&::before {
		content: "";
		background-color: ${COLORS.light};
		border: 2px solid ${COLORS.lightBorder};
		display: block;
		width: 20px;
		height: calc(100% + 20px);
		transform: translateY(-10px);
		position: absolute;
	}
`;

const createRangeThumb = ({ props }) => (
	<div
		{...props}
		style={{
			...props.style,
			height: "20px",
			width: "20px",
			backgroundColor: COLORS.fc,
		}}
	/>
);

const CenteredSmall = styled.div`
	font-size: 0.7em;
	text-align: center;
`;

const CenteredLarge = styled.div`
	font-size: 2em;
	font-weight: bold;
	text-align: center;
`;

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: IBeatronomeAppProps) {
		super(props);

		subscribe(() => this.setState({}));

		this.initialize();
	}

	private async initialize(): Promise<void> {
		await this.loadDrumsetIndex();

		await this.loadDrumset(getState().audio.availableDrumsets[0]);

		let fnDrumloop = "debug.txt";
		if (IS_PRODUCTION) {
			fnDrumloop = "straight44.txt";
		}
		await this.loadDrumloop(fnDrumloop);
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
		const absAngle = Math.abs(orientation.angle);
		const landscapeOrientation = absAngle === 90 || absAngle === 270;
		const width = window.innerWidth;
		const height = window.innerHeight;
		let newMode: EDeviceMode = null;

		if (width > 1024 && height > 1024) {
			newMode = EDeviceMode.Desktop;
		} else {
			if (landscapeOrientation) {
				if (height > 400) {
					newMode = EDeviceMode.BigLandscape;
				} else {
					newMode = EDeviceMode.SmallLandscape;
				}
			}

			// portrait mode
			else {
				if (width > 400) {
					newMode = EDeviceMode.BigPortrait;
				} else {
					newMode = EDeviceMode.SmallPortrait;
				}
			}
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
		await audioManInstance.loadDrumset(drumset, DIR_DRUMSETS);
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
			compiledMeasure: {},
			metaMeasure: {},
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
		audioManInstance.compile();
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
		const deviceMode = getState().ui.deviceMode;

		const groupTempoChange: JSX.Element = (
			<>
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
			</>
		);

		const groupVolumeSlider: JSX.Element = (
			<>
				<Row>
					<CenteredSmall>Volume</CenteredSmall>
				</Row>
				<SliderPadding>
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
						renderThumb={createRangeThumb}
					></Range>
				</SliderPadding>
			</>
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
				renderThumb={createRangeThumb}
			></Range>
		);

		const rowPlayTimer: JSX.Element = (
			<FixedRow>
				<Column>
					<CenteredSmall>Timer</CenteredSmall>
					<CenteredLarge>{timerString}</CenteredLarge>
				</Column>
				<FixedColumn deviceMode={deviceMode}>
					<Button
						action={() => resetTimerIfStopped()}
						disabled={audioState.isPlaying || audioState.timer < 3}
					>
						<FontAwesomeIcon
							size={iconSize}
							icon="undo"
						></FontAwesomeIcon>
					</Button>
				</FixedColumn>
				<FixedColumn deviceMode={deviceMode}>
					<Button action={() => togglePlay()}>
						<FontAwesomeIcon
							size={iconSize}
							icon={
								audioState.isPlaying
									? "stop-circle"
									: "play-circle"
							}
						></FontAwesomeIcon>
					</Button>
				</FixedColumn>
				<Column>
					<CenteredSmall># in tempo</CenteredSmall>
					<CenteredLarge>{measuresInCurrentTempo}</CenteredLarge>
				</Column>
			</FixedRow>
		);

		const columnMatrix = (
			<Column>
				<Matrix></Matrix>
			</Column>
		);

		const columnLargeTempoDisplay = (
			<Column>
				<CenteredLarge>{audioState.bpm + " BPM"}</CenteredLarge>
			</Column>
		);

		const columnSmallTempoDisplay = (
			<FixedColumn deviceMode={deviceMode}>
				<CenteredSmall>BPM</CenteredSmall>
				<CenteredLarge>{audioState.bpm}</CenteredLarge>
			</FixedColumn>
		);

		const buttonTapTempo = (
			<Button action={tapTempo}>
				<FontAwesomeIcon
					size={iconSize}
					icon="hand-point-up"
				></FontAwesomeIcon>
			</Button>
		);

		let groupContainer: JSX.Element;

		// smartphone portrait mode
		if (deviceMode === EDeviceMode.SmallPortrait) {
			groupContainer = (
				<>
					<FlexRow>{columnMatrix}</FlexRow>
					<Row>
						<FixedColumn deviceMode={deviceMode}>
							{groupVolumeSlider}
						</FixedColumn>
						<Column>
							<Row>{buttonTapTempo}</Row>
							<FlexRow>{columnSmallTempoDisplay}</FlexRow>
						</Column>
						<FixedColumn deviceMode={deviceMode}>
							{groupTempoChange}
						</FixedColumn>
					</Row>
					<Row>
						<SliderPadding>{sliderTempo}</SliderPadding>
					</Row>
					{rowPlayTimer}
				</>
			);
		}

		// smartphone landscape mode
		else if (deviceMode === EDeviceMode.SmallLandscape) {
			groupContainer = (
				<>
					<FlexRow>
						<FixedColumn deviceMode={deviceMode}>
							{groupVolumeSlider}
						</FixedColumn>
						{columnMatrix}
						<FixedColumn deviceMode={deviceMode}>
							{groupTempoChange}
						</FixedColumn>
					</FlexRow>
					<Row>
						<FixedColumn deviceMode={deviceMode}>
							{buttonTapTempo}
						</FixedColumn>
						<Column>
							<SliderPadding>{sliderTempo}</SliderPadding>
						</Column>
						{columnSmallTempoDisplay}
					</Row>
					{rowPlayTimer}
				</>
			);
		}

		// tablet portrait mode
		else if (deviceMode === EDeviceMode.BigPortrait) {
			groupContainer = (
				<>
					<FlexRow>{columnMatrix}</FlexRow>
					<Row>
						<FixedColumn deviceMode={deviceMode}>
							{groupVolumeSlider}
						</FixedColumn>
						<Column>
							<Row>
								<FixedColumn deviceMode={deviceMode}>
									{buttonTapTempo}
								</FixedColumn>
								<Column>{columnLargeTempoDisplay}</Column>
								<FixedColumn
									deviceMode={deviceMode}
								></FixedColumn>
							</Row>
							<Row>
								<SliderPadding>{sliderTempo}</SliderPadding>
							</Row>
							{rowPlayTimer}
						</Column>
						<FixedColumn deviceMode={deviceMode}>
							{groupTempoChange}
						</FixedColumn>
					</Row>
				</>
			);
		}

		// tablet landscape mode
		else if (deviceMode === EDeviceMode.BigLandscape) {
			groupContainer = (
				<>
					<FlexRow>{columnMatrix}</FlexRow>
					<Row>
						<FixedColumn deviceMode={deviceMode}>
							{groupVolumeSlider}
						</FixedColumn>
						<Column>
							<Row>
								<FixedColumn deviceMode={deviceMode}>
									{buttonTapTempo}
								</FixedColumn>
								<Column>{columnLargeTempoDisplay}</Column>
								<FixedColumn
									deviceMode={deviceMode}
								></FixedColumn>
							</Row>
							<Row>
								<SliderPadding>{sliderTempo}</SliderPadding>
							</Row>
							{rowPlayTimer}
						</Column>
						<FixedColumn deviceMode={deviceMode}>
							{groupTempoChange}
						</FixedColumn>
					</Row>
				</>
			);
		}

		// desktop mode
		else {
			groupContainer = (
				<>
					<FlexRow>{columnMatrix}</FlexRow>
					<Row>
						<FixedColumn deviceMode={deviceMode}>
							{groupVolumeSlider}
						</FixedColumn>
						<Column>
							<Row>
								<FixedColumn deviceMode={deviceMode}>
									{buttonTapTempo}
								</FixedColumn>
								<Column>{columnLargeTempoDisplay}</Column>
								<FixedColumn
									deviceMode={deviceMode}
								></FixedColumn>
							</Row>
							<Row>
								<SliderPadding>{sliderTempo}</SliderPadding>
							</Row>
							{rowPlayTimer}
						</Column>
						<FixedColumn deviceMode={deviceMode}>
							{groupTempoChange}
						</FixedColumn>
					</Row>
				</>
			);
		}

		return (
			<AllDiv deviceMode={deviceMode}>
				<GlobalStyle></GlobalStyle>
				<Heading>Beatronome</Heading>
				<ContainerDiv>{groupContainer}</ContainerDiv>
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
