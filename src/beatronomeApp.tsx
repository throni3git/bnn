import * as React from "react";
import { orientation } from "o9n";

import { createGlobalStyle } from "styled-components";
import { Range, Direction } from "react-range";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { DIR_DRUMSETS, DIR_LOOPS } from "./constants";
import Matrix from "./matrix";
import {
	AllDiv,
	Heading,
	ContainerDiv,
	SliderPadding,
	FlexRow,
	Row,
	FixedRow,
	Column,
	FixedColumn,
	RangeTrackHorizontal,
	RangeTrackVertical,
	createRangeThumb,
	CenteredSmall,
	CenteredLarge,
} from "./uiElements";

declare var IS_PRODUCTION: boolean;

const GlobalStyle = createGlobalStyle`
	*, *:before, *:after {
		box-sizing: border-box;
	}
`;

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;

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
