import * as React from "react";
import { orientation } from "o9n";

import { createGlobalStyle } from "styled-components";
import { Range, Direction } from "react-range";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as Store from "./store";
import * as Types from "./types";
import * as Utils from "./util";

import { audioManInstance } from "./audioMan";
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
	MetricsDiv,
} from "./uiElements";

declare var IS_PRODUCTION: boolean;

const GlobalStyle = createGlobalStyle`
	@font-face {
		font-family: "comfortaa";
		src: url(./assets/fonts/Comfortaa-Regular.woff2) format("woff2");
	}
	*, *:before, *:after {
		box-sizing: border-box;
		user-select: none;
		font-family: 'comfortaa';
	}
	*:focus {
		outline: none;
	}
`;

const bracketsRegEx = /\[[^\]]*\]/;
const meterRegEx = /\d/;
const spaceRegEx = /\ /g;
const rawMeterRegEx = /[\ \d]/;

export class BeatronomeApp extends React.Component<
	IBeatronomeAppProps,
	IBeatronomeAppState
> {
	constructor(props: IBeatronomeAppProps) {
		super(props);

		Store.subscribe(() => this.setState({}));

		this.initialize();
	}

	private async initialize(): Promise<void> {
		await this.loadDrumsetIndex();

		await this.loadDrumset(Store.getState().audio.availableDrumsets[0]);

		let fnDrumloop = "debug.txt";
		if (IS_PRODUCTION) {
			fnDrumloop = "straight44.txt";
		}
		await this.loadDrumloopFromURL(fnDrumloop);
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
		let newMode: Types.EDeviceMode = null;

		if (width > 1024 && height > 1024) {
			newMode = Types.EDeviceMode.Desktop;
		} else {
			if (landscapeOrientation) {
				if (height > 400) {
					newMode = Types.EDeviceMode.BigLandscape;
				} else {
					newMode = Types.EDeviceMode.SmallLandscape;
				}
			}

			// portrait mode
			else {
				if (width > 400) {
					newMode = Types.EDeviceMode.BigPortrait;
				} else {
					newMode = Types.EDeviceMode.SmallPortrait;
				}
			}
		}

		const uiState = Store.getState().ui;

		if (uiState.deviceMode !== newMode) {
			if (Store.getState().debugging.logDeviceOrientation) {
				console.log(
					newMode + " (angle " + screen.orientation.angle + ")"
				);
			}
			Store.setUserInterfaceState("deviceMode", newMode);
		}
	};

	/**
	 * get overview of drumsets available
	 * @param url
	 */
	private async loadDrumsetIndex(): Promise<void> {
		const rawJson = await fetch(DIR_DRUMSETS + "index.json");
		const overview = (await rawJson.json()) as { entries: Array<string> };
		Store.setAudioState("availableDrumsets", overview.entries);
	}

	/**
	 * prepare drumset and set it as current
	 * @param url
	 */
	private async loadDrumset(name: string): Promise<void> {
		const rawJson = await fetch(DIR_DRUMSETS + name);
		const drumset = (await rawJson.json()) as Types.IDrumset;
		await audioManInstance.loadDrumset(drumset, DIR_DRUMSETS);
	}

	/**
	 * parse drumloop from text file
	 * @param url
	 */
	private async loadDrumloopFromURL(filename: string): Promise<void> {
		const rawText = await fetch(DIR_LOOPS + filename);
		const text = await rawText.text();
		Store.setAudioState("rawDrumLoopText", text);
		this.parseDrumloop();
	}

	/**
	 * parse drumloop from text file
	 * @param url
	 */
	private parseDrumloop(): void {
		const drumloop: Types.IDrumLoop = {
			denominator: 4,
			enumerator: 4,
			textBeats: {},
			compiledBeats: {},
		};
		const text = Store.getState().audio.rawDrumLoopText;
		const lines = text.split("\n");

		for (const line of lines) {
			Utils.log("logDrumLoopParsing", line);

			// set time signature
			// e.g.: time[4/4]
			if (line.startsWith("time")) {
				const time = bracketsRegEx.exec(line);
				if (time && time[0]) {
					const ts = time[0].substring(1, time[0].length - 1);
					const tsSplit = ts.split("/");
					drumloop.enumerator = parseInt(tsSplit[0], 10);
					drumloop.denominator = parseInt(tsSplit[1], 10);
					Utils.log(
						"logDrumLoopParsing",
						"time signature found: " + tsSplit
					);
				}
			} else {
				// check if an instrument is referenced
				// e.g.: hhc......[9 6 |8 6 |9 6 |8 6 ]
				const instrKey = Types.DrumsetKeyArray.find((key) =>
					line.startsWith(key)
				);
				const drumLine = bracketsRegEx.exec(line);

				if (instrKey && drumLine && drumLine[0]) {
					Utils.log("logDrumLoopParsing", drumLine);
					Utils.log(
						"logDrumLoopParsing",
						"drumLine [" + instrKey + "] found: " + drumLine[0]
					);

					// only take drum lines that have notes
					const dl = drumLine[0].substring(1, drumLine[0].length - 1);
					const singleMeters = dl.split("|");
					const hasOnsets = singleMeters.some((meter) =>
						meterRegEx.test(meter)
					);
					const isValid = singleMeters.every((meter) =>
						rawMeterRegEx.test(meter)
					);
					if (hasOnsets && isValid) {
						const cleanSingleMeters = singleMeters.map((meter) =>
							meter.replace(spaceRegEx, "0")
						);
						drumloop.textBeats[instrKey] = cleanSingleMeters;
					} else if (hasOnsets && !isValid) {
						console.log(`ES IST WAS SCHIEF GEGANGEN ${dl}`);
					}
				}
			}
		}

		Utils.log("logDrumLoopParsing", drumloop);

		Store.setAudioState("drumLoop", drumloop);
		audioManInstance.compile();
	}

	public render() {
		const audioState = Store.getState().audio;
		const timer = new Date(audioState.timer * 1000);
		const minutes = (new Array(2).join("0") + timer.getMinutes()).slice(-2);
		const seconds = (new Array(2).join("0") + timer.getSeconds()).slice(-2);
		const timerString = `${minutes}:${seconds}`;
		const measuresInCurrentTempo = Math.max(
			audioState.measuresInCurrentTempo,
			0
		);

		const uiState = Store.getState().ui;
		const deviceMode = uiState.deviceMode;
		const isSmallDevice =
			deviceMode === Types.EDeviceMode.SmallPortrait ||
			deviceMode === Types.EDeviceMode.SmallLandscape;
		const buttonIconSize = isSmallDevice ? "1.4em" : "2em";

		const modePlay = uiState.displayMode == Types.EDisplayMode.Play;
		const modeSettings = uiState.displayMode == Types.EDisplayMode.Settings;
		const modeVolume = uiState.displayMode == Types.EDisplayMode.Volume;
		const modeMetrics = uiState.displayMode == Types.EDisplayMode.Metrics;

		const groupTempoChange: JSX.Element = (
			<>
				<Button action={Utils.increaseBpm}>
					<FontAwesomeIcon
						style={{ fontSize: buttonIconSize }}
						icon="plus-circle"
					></FontAwesomeIcon>
				</Button>
				<Button action={Utils.decreaseBpm}>
					<FontAwesomeIcon
						style={{ fontSize: buttonIconSize }}
						icon="minus-circle"
					></FontAwesomeIcon>
				</Button>
			</>
		);

		const groupVolumeSlider: JSX.Element = (
			<>
				<Row>
					<CenteredSmall>volume</CenteredSmall>
				</Row>
				<SliderPadding>
					<Range
						values={[audioState.masterVolume * 1000.0]}
						min={0}
						max={1000}
						direction={Direction.Up}
						onChange={(values) => {
							const vol = values[0] / 1000;
							Utils.setMasterVolume(vol);
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

		const sliderDivisions: JSX.Element = (
			<Range
				values={[4]}
				min={3}
				max={7}
				onChange={this.changeDivisions}
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
					<CenteredSmall>timer</CenteredSmall>
					<CenteredLarge>{timerString}</CenteredLarge>
				</Column>
				<FixedColumn deviceMode={deviceMode}>
					<Button
						action={() => Utils.resetTimerIfStopped()}
						disabled={audioState.isPlaying || audioState.timer < 3}
					>
						<FontAwesomeIcon
							style={{ fontSize: buttonIconSize }}
							icon="undo"
						></FontAwesomeIcon>
					</Button>
				</FixedColumn>
				<FixedColumn deviceMode={deviceMode}>
					<Button action={() => Utils.togglePlay()}>
						<FontAwesomeIcon
							style={{ fontSize: buttonIconSize }}
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
				<CenteredLarge>{audioState.bpm + " bpm"}</CenteredLarge>
			</Column>
		);

		const columnSmallTempoDisplay = (
			<FixedColumn deviceMode={deviceMode}>
				<CenteredSmall>bpm</CenteredSmall>
				<CenteredLarge>{audioState.bpm}</CenteredLarge>
			</FixedColumn>
		);

		const buttonTapTempo = (
			<Button action={Utils.tapTempo}>
				<FontAwesomeIcon
					style={{ fontSize: buttonIconSize }}
					icon="hand-point-up"
				></FontAwesomeIcon>
			</Button>
		);

		const buttonMetricsMode = (
			<Button
				action={() => {
					const isMetricsMode =
						Store.getState().ui.displayMode ==
						Types.EDisplayMode.Metrics;
					const newMode = isMetricsMode
						? Types.EDisplayMode.Play
						: Types.EDisplayMode.Metrics;
					Store.setUserInterfaceState("displayMode", newMode);
				}}
			>
				<FontAwesomeIcon
					style={{ fontSize: buttonIconSize }}
					icon="pen"
				></FontAwesomeIcon>
			</Button>
		);

		let groupContainer: JSX.Element;

		// smartphone portrait mode
		if (deviceMode === Types.EDeviceMode.SmallPortrait) {
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
								<FixedColumn deviceMode={deviceMode}>
									{buttonMetricsMode}
								</FixedColumn>
							</Row>
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
		else if (deviceMode === Types.EDeviceMode.SmallLandscape) {
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
							{buttonMetricsMode}
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
		else if (deviceMode === Types.EDeviceMode.BigPortrait) {
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
								<FixedColumn deviceMode={deviceMode}>
									{buttonMetricsMode}
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
		else if (deviceMode === Types.EDeviceMode.BigLandscape) {
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
								<FixedColumn deviceMode={deviceMode}>
									{buttonMetricsMode}
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
					{modePlay && (
						<Row>
							<FixedColumn deviceMode={deviceMode}>
								{groupVolumeSlider}
							</FixedColumn>
							<Column>
								<Row>
									<FixedColumn deviceMode={deviceMode}>
										{buttonTapTempo}
									</FixedColumn>
									<FixedColumn deviceMode={deviceMode}>
										{buttonMetricsMode}
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
					)}
					{modeMetrics && (
						<>
							<Row>
								<FixedColumn deviceMode={deviceMode}>
									{sliderDivisions}
								</FixedColumn>
								<FixedColumn
									deviceMode={deviceMode}
								></FixedColumn>
							</Row>
							<Row>
								<FixedColumn deviceMode={deviceMode}>
									{buttonMetricsMode}
								</FixedColumn>
								<Row>
									<Button
										action={() => Utils.setSubdivisions(3)}
									>
										{/* <FontAwesomeIcon
											style={{
												fontSize: buttonIconSize,
											}}
											icon="minus"
										></FontAwesomeIcon> */}
										3
									</Button>
									<MetricsDiv isSmallDevice={isSmallDevice}>
										{4}
									</MetricsDiv>
									<Button
										action={() => Utils.setSubdivisions(4)}
									>
										{/* <FontAwesomeIcon
											style={{
												fontSize: buttonIconSize,
											}}
											icon="plus"
										></FontAwesomeIcon> */}4
									</Button>
								</Row>
							</Row>
						</>
					)}
				</>
			);
		}

		return (
			<AllDiv deviceMode={deviceMode}>
				<GlobalStyle></GlobalStyle>
				<Heading>beatronome</Heading>
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

		Store.setAudioState("measuresInCurrentTempo", -1);
		Store.setAudioState("bpm", bpm);
	};

	/**
	 * callback setting up state for changed divisions
	 */
	private changeDivisions = (values: number[]) => {
		const divisions = values[0];
		console.log(divisions);
		console.log("not implemented yet");

		// Store.setAudioState("measuresInCurrentTempo", -1);
		// Store.setAudioState("bpm", bpm);
	};
}

export default BeatronomeApp;

export interface IBeatronomeAppProps {}

interface IBeatronomeAppState {}
