import * as React from "react";

import styled from "styled-components";

import * as Store from "./store";
import * as Types from "./types";
import { audioManInstance } from "./audioMan";

const Container = styled.div`
	background: limegreen;
	height: 100%;
	width: 100%;
	padding: 5px;
	display: flex;
	flex-direction: column;
`;

const Row = styled.div`
	background: yellow;
	padding: 5px;
	display: flex;
	flex: 1;
	justify-content: space-around;
`;

const Division = styled.span`
	background: darkviolet;
	padding: 5px;
	width: 100%;
	display: flex;
	justify-content: space-around;
`;

const Onset = styled.span`
	background: #003000;
	margin: 4px;
	width: 100%;
	text-align: center;
	display: flex;
	align-items: center;
	transition: transform 0.21s;
	border-width: 2px;
	border-style: solid;
	/* border-radius: 5px; */
	cursor: pointer;
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
		const instrumentKeys = Object.keys(compiledMeasure);

		if (!compiledMeasure) {
			return null;
		}

		return (
			<Container>
				{instrumentKeys.map((instrumentKey, rowIdx: number) => (
					<Row key={rowIdx}>
						{compiledMeasure[instrumentKey].map(
							(beat: Types.IBeat, beatIdx: number) => (
								<Division key={beatIdx}>
									{beat.onsets.map((onset, onsetIdx) =>
										this.getOnsetElement(
											instrumentKey as any,
											beatIdx,
											onsetIdx,
											onset
										)
									)}
								</Division>
							)
						)}
					</Row>
				))}
			</Container>
		);
	}

	private getOnsetElement(
		instrKey: Partial<Types.DrumsetKeys>,
		beatIdx: number,
		onsetIdx: number,
		onset: Types.IOnset
	): JSX.Element {
		const hlState = Store.getState().ui.highlightOnsets;
		const audioState = Store.getState().audio;
		const isActive =
			hlState[instrKey].position == beatIdx &&
			hlState[instrKey].subEnumerator == onsetIdx;

		return (
			<Onset
				key={onsetIdx}
				style={{
					borderColor: isActive ? "lightgreen" : "darkgreen",
					transitionTimingFunction: isActive
						? "step-start"
						: "linear",

					transform:
						isActive && audioState.isPlaying
							? "translateY(5px)"
							: null,
					fontWeight: onset.velocity * 1000,
					color: isActive ? "red" : "white",
					background: onset.velocity > 0 ? "darkgreen" : null,
				}}
				onClick={() => {
					const m = `${instrKey} ${beatIdx} ${onsetIdx} ${onset.velocity}`;
					console.log(m);

					// TODO 2020-12-27 besseres benutzungskonzept für laut und leise beats
					let instr = Store.getState().audio.drumLoop.textBeats[
						instrKey
					];
					let beat = instr[beatIdx];
					let insertion = onset.velocity > 0 ? 0 : 6;
					let newBeat =
						beat.substr(0, onsetIdx) +
						insertion +
						beat.substr(onsetIdx + 1);
					instr[beatIdx] = newBeat;
					audioManInstance.compile();
				}}
			>
				<OnsetInner>
					{beatIdx}
					<br></br>
					{onsetIdx}
					<br></br>
					{onset.velocity * 9}
				</OnsetInner>
			</Onset>
		);
	}
}

export default Matrix;

export interface IMatrixProps {}

interface IMatrixState {}
