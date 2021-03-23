import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styled from "styled-components";

import * as Store from "./store";
import * as Types from "./types";
import { audioManInstance } from "./audioMan";
import { COLORS, UI_CONSTANTS } from "./constants";
import Button from "./button";
import { MetricsDiv } from "./uiElements";

const Container = styled.div`
	background: ${COLORS.bg};
	height: 100%;
	width: 100%;
	padding: 2px;
	display: flex;
	flex-direction: column;
	position: relative;
`;

const Row = styled.div<{ isSmallDevice: boolean }>(
	(props) => `
	// background: ${COLORS.bg};
	padding: ${props.isSmallDevice ? 0 : "2px"};
	display: flex;
	flex: 1;
	justify-content: space-around;
	position: relative;
`
);

const EmblemOverlay = styled.div<{
	emblemUrl: string;
	isPlayMode: boolean;
}>(
	(props) => `
	position: absolute;
	inset: 0;
	opacity: ${props.isPlayMode ? 0.6 : 0.2};
	background-image: url(assets/drum-symbols-${
		props.isPlayMode ? "white" : "black"
	}/${props.emblemUrl}.png);
    background-position: left center;
	background-repeat: no-repeat;
    background-size: contain;
	pointer-events: none;
	z-index:1;
`
);

const Division = styled.div<{ isSmallDevice: boolean }>(
	(props) => `
	// background: ${COLORS.bg};
	margin: ${props.isSmallDevice ? "2px" : "4px"};
	width: 100%;
	display: flex;
	justify-content: space-around;
	position: relative;
`
);

const DivisionInner = styled.div`
	/* background: ${COLORS.bg}; */
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Onset = styled.span`
	background: ${COLORS.light};
	margin-left: 2px;
	margin-right: 2px;
	width: 100%;
	height: 100%;
	text-align: center;
	display: flex;
	align-items: center;
	/* border-width: 2px; */
	/* border-style: solid; */
	cursor: pointer;
	&:first-child {
		border-radius: ${UI_CONSTANTS.br} 0 0 ${UI_CONSTANTS.br};
		margin-left: 0px;
	}
	&:last-child {
		border-radius: 0 ${UI_CONSTANTS.br} ${UI_CONSTANTS.br} 0;
		margin-right: 0px;
	}
`;

const OnsetInner = styled.div`
	flex: 1;
`;

export class Matrix extends React.Component<IMatrixProps, IMatrixState> {
	constructor(props: IMatrixProps) {
		super(props);
	}

	public render(): JSX.Element {
		const audioState = Store.getState().audio;
		if (audioState.drumLoop == null) {
			return null;
		}
		const compiledMeasure = audioState.drumLoop.compiledBeats;
		if (!compiledMeasure) {
			return null;
		}

		// get sorted keys according to order in Types.DrumsetKeyArray
		const instrumentKeys = Object.keys(compiledMeasure);
		instrumentKeys.sort(
			(a: Types.DrumsetKeys, b: Types.DrumsetKeys) =>
				Types.DrumsetKeyArray.indexOf(a) -
				Types.DrumsetKeyArray.indexOf(b)
		);

		const uiState = Store.getState().ui;
		const isSmallDevice =
			uiState.deviceMode == Types.EDeviceMode.SmallLandscape ||
			uiState.deviceMode == Types.EDeviceMode.SmallPortrait;

		const buttonIconSize = isSmallDevice ? "1em" : "2em";

		const modePlay = uiState.displayMode == Types.EDisplayMode.Play;
		const modeSettings = uiState.displayMode == Types.EDisplayMode.Settings;
		const modeVolume = uiState.displayMode == Types.EDisplayMode.Volume;
		const modeMetrics = uiState.displayMode == Types.EDisplayMode.Metrics;

		return (
			<Container>
				{instrumentKeys.map((instrumentKey, rowIdx: number) => (
					<Row key={rowIdx} isSmallDevice={isSmallDevice}>
						{compiledMeasure[instrumentKey].map(
							(beat: Types.IBeat, beatIdx: number) => (
								<Division
									key={beatIdx}
									isSmallDevice={isSmallDevice}
								>
									{beatIdx == 0 && (
										<EmblemOverlay
											isPlayMode={modePlay}
											emblemUrl={instrumentKey}
										></EmblemOverlay>
									)}
									<DivisionInner>
										{modePlay &&
											beat.onsets.map((onset, onsetIdx) =>
												this.getOnsetElement(
													instrumentKey as any,
													beatIdx,
													onsetIdx,
													onset
												)
											)}
										{modeMetrics && (
											// <div>
											<>
												<Button
													action={() =>
														this.removeOnset(
															instrumentKey,
															beatIdx
														)
													}
												>
													<FontAwesomeIcon
														style={{
															fontSize: buttonIconSize,
														}}
														icon="minus"
													></FontAwesomeIcon>
												</Button>
												<MetricsDiv
													isSmallDevice={
														isSmallDevice
													}
												>
													{beat.onsets.length}
												</MetricsDiv>
												<Button
													action={() =>
														this.addOnset(
															instrumentKey,
															beatIdx
														)
													}
												>
													<FontAwesomeIcon
														style={{
															fontSize: buttonIconSize,
														}}
														icon="plus"
													></FontAwesomeIcon>
												</Button>
											</>
											// </div>
										)}
									</DivisionInner>
								</Division>
							)
						)}
					</Row>
				))}
			</Container>
		);
	}

	private addOnset = (instrumentKey: string, beatIdx: number) => {
		const audioState = Store.getState().audio;
		const instrument: string[] =
			audioState.drumLoop.textBeats[instrumentKey];
		let textBeat = instrument[beatIdx];
		if (textBeat.length < 6) {
			textBeat += "0";
			audioState.drumLoop.textBeats[instrumentKey][beatIdx] = textBeat;
			audioManInstance.compile();
		}
	};

	private removeOnset = (instrumentKey: string, beatIdx: number) => {
		const audioState = Store.getState().audio;
		const instrument: string[] =
			audioState.drumLoop.textBeats[instrumentKey];
		let textBeat = instrument[beatIdx];
		if (textBeat.length > 3) {
			textBeat = textBeat.substring(0, textBeat.length - 1);
			audioState.drumLoop.textBeats[instrumentKey][beatIdx] = textBeat;
			audioManInstance.compile();
		}
	};

	private getOnsetElement(
		instrKey: Partial<Types.DrumsetKeys>,
		beatIdx: number,
		onsetIdx: number,
		onset: Types.IOnset
	): JSX.Element {
		const audioState = Store.getState().audio;
		const hlState = Store.getState().ui.highlightOnsets;
		const isActive =
			audioState.isPlaying &&
			hlState[instrKey].position == beatIdx &&
			hlState[instrKey].subEnumerator == onsetIdx &&
			hlState[instrKey].enabled &&
			onset.velocity > 0;

		const onsetBorderColor = isActive
			? COLORS.lightActive
			: onset.velocity > 0
			? COLORS.lightActive
			: COLORS.light;

		const onsetBackgroundColor = isActive
			? COLORS.lightHighlight
			: onset.velocity > 0
			? COLORS.lightBorder
			: COLORS.light;

		return (
			<Onset
				key={onsetIdx}
				style={{
					// borderColor: onsetBorderColor,
					fontWeight: onset.velocity * 1000,
					background: onsetBackgroundColor,
				}}
				onClick={() => {
					const m = `${instrKey} ${beatIdx} ${onsetIdx} ${onset.velocity}`;
					console.log(m);

					// TODO 2020-12-27 besseres benutzungskonzept für laut und leise beats
					let instr = Store.getState().audio.drumLoop.textBeats[
						instrKey
					];
					let beat = instr[beatIdx];
					let insertion = onset.velocity > 0 ? 0 : 4; // von 0..9
					let newBeat =
						beat.substr(0, onsetIdx) +
						insertion +
						beat.substr(onsetIdx + 1);
					instr[beatIdx] = newBeat;
					audioManInstance.compile();
				}}
			>
				<OnsetInner></OnsetInner>
			</Onset>
		);
	}
}

export default Matrix;

export interface IMatrixProps {}

interface IMatrixState {}
