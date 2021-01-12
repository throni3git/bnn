import * as React from "react";

import styled from "styled-components";

import * as Store from "./store";
import * as Types from "./types";
import { audioManInstance } from "./audioMan";
import { COLORS } from "./constants";

const Container = styled.div`
	background: ${COLORS.bg};
	height: 100%;
	width: 100%;
	padding: 2px;
	display: flex;
	flex-direction: column;
`;

const Row = styled.div`
	background: ${COLORS.bg};
	padding: 2px;
	display: flex;
	flex: 1;
	justify-content: space-around;
`;

const Division = styled.span`
	background: ${COLORS.bg};
	padding: 4px;
	width: 100%;
	display: flex;
	justify-content: space-around;
`;

const Onset = styled.span`
	background: ${COLORS.light};
	margin: 2px;
	width: 100%;
	text-align: center;
	display: flex;
	align-items: center;
	border-width: 2px;
	border-style: solid;
	cursor: pointer;
	&:first-child {
		border-radius: 1em 0 0 1em;
	}
	&:last-child {
		border-radius: 0 1em 1em 0;
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
		const isActive =
			hlState[instrKey].position == beatIdx &&
			hlState[instrKey].subEnumerator == onsetIdx &&
			hlState[instrKey].enabled;

		return (
			<Onset
				key={onsetIdx}
				style={{
					borderColor: isActive
						? COLORS.lightActive
						: onset.velocity > 0
						? COLORS.lightActive
						: COLORS.light,
					fontWeight: onset.velocity * 1000,
					// color: isActive ? COLORS.bg : null,
					background: isActive
						? COLORS.lightHighlight
						: onset.velocity > 0
						? COLORS.lightBorder
						: COLORS.light,
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
				<OnsetInner>
					{/* {beatIdx}
					<br></br>
					{onsetIdx}
					<br></br>
					{onset.velocity * 9} */}
				</OnsetInner>
			</Onset>
		);
	}
}

export default Matrix;

export interface IMatrixProps {}

interface IMatrixState {}
