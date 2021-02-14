import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styled from "styled-components";

import * as Store from "./store";
import * as Types from "./types";
import { audioManInstance } from "./audioMan";
import { COLORS, UI_CONSTANTS } from "./constants";
import Button from "./button";

const Container = styled.div`
	background: ${COLORS.bg};
	height: 100%;
	width: 100%;
	padding: 2px;
	display: flex;
	flex-direction: column;
`;

const Row = styled.div<{ isSmallDevice: boolean }>(
	(props) => `
	// background: ${COLORS.bg};
	padding: ${props.isSmallDevice ? 0 : "2px"};
	display: flex;
	flex: 1;
	justify-content: space-around;
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
	margin: 2px;
	width: 100%;
	height: 100%;
	text-align: center;
	display: flex;
	align-items: center;
	border-width: 2px;
	border-style: solid;
	cursor: pointer;
	&:first-child {
		border-radius: ${UI_CONSTANTS.br} 0 0 ${UI_CONSTANTS.br};
	}
	&:last-child {
		border-radius: 0 ${UI_CONSTANTS.br} ${UI_CONSTANTS.br} 0;
	}
`;

const OnsetInner = styled.div`
	flex: 1;
`;

const MetricsDiv = styled.div<{ isSmallDevice: boolean }>(
	(props) => `
	padding: ${props.isSmallDevice ? "2px 0" : "4px 0"};
	text-align: center;
	font-size: ${props.isSmallDevice ? "1em" : "2em"};
`
);

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
		const instrumentKeys = Object.keys(compiledMeasure);

		if (!compiledMeasure) {
			return null;
		}

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
					borderColor: onsetBorderColor,
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
