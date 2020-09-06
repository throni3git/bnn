import * as React from "react";

import { subscribe, getState, setAudioState } from "./store";

import styled from "styled-components";
import { IDivision } from "./types";

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
	background: violet;
	padding: 5px;
	width: 100%;
	display: flex;
	justify-content: space-around;
`;

const Onset = styled.span`
	background: green;
	margin: 4px;
	width: 100%;
	text-align: center;
	border-radius: 3px;
`;

export class Matrix extends React.Component<IMatrixProps, IMatrixState> {
	constructor(props: IMatrixProps) {
		super(props);
	}

	public componentDidMount() {
		subscribe(() => this.setState({}));
	}

	public render(): JSX.Element {
		const audioState = getState().audio;
		if (audioState.drumLoop == null) {
			return null;
		}
		const compiledMeasure = audioState.drumLoop.compiledMeasure;
		const metaMeasure = audioState.drumLoop.metaMeasure;
		const instrumentKeys = Object.keys(compiledMeasure);

		return (
			<Container>
				{instrumentKeys.map((instrumentKey, rowIdx: number) => (
					<Row key={rowIdx}>
						{metaMeasure[instrumentKey].map(
							(division: IDivision, divisionIdx: number) => (
								<Division key={divisionIdx}>
									{division.subDenominatorArray.map(
										(subDenominator, subDenominatorIdx) => (
											<Onset
												key={subDenominatorIdx}
												onClick={() =>
													console.log(
														`${rowIdx} ${divisionIdx} ${subDenominatorIdx}`
													)
												}
											>
												{subDenominator}
											</Onset>
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
}

export default Matrix;

export interface IMatrixProps {}

interface IMatrixState {}
