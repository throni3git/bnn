import * as React from "react";

import { subscribe, getState, setAudioState } from "./store";

import styled from "styled-components";
import { IBeat } from "./types";

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
	/* max-height: 10%; */
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
	background: darkgreen;
	margin: 4px;
	width: 100%;
	text-align: center;
	border-radius: 3px;
	display: flex;
	align-items: center;
`;

const OnsetInner = styled.div`
	flex: 1;
`;

export class Matrix extends React.Component<IMatrixProps, IMatrixState> {
	constructor(props: IMatrixProps) {
		super(props);
	}

	public componentDidMount() {
		subscribe(() => {
			console.log("trara");
			this.setState({});
		});
	}

	public render(): JSX.Element {
		const audioState = getState().audio;
		const hlState = getState().ui.highlightOnsets;
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
							(beat: IBeat, beatIdx: number) => (
								<Division key={beatIdx}>
									{beat.onsets.map((onset, onsetIdx) => (
										<Onset
											key={onsetIdx}
											onClick={() =>
												console.log(
													`${instrumentKey} ${beatIdx} ${onsetIdx} ${onset.velocity}`
												)
											}
										>
											<OnsetInner
												style={{
													fontWeight:
														onset.velocity * 1000,
													color:
														hlState[instrumentKey]
															.position ==
															beatIdx &&
														hlState[instrumentKey]
															.subEnumerator ==
															onsetIdx
															? "red"
															: "white",
												}}
											>
												{`${beatIdx} ${onsetIdx} ${
													onset.velocity * 9
												}`}
											</OnsetInner>
										</Onset>
									))}
								</Division>
							)
						)}
					</Row>
				))}
			</Container>
		);
	}
}

export default Matrix;

export interface IMatrixProps {}

interface IMatrixState {}
