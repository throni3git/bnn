import * as React from "react";

import { subscribe, getState, setAudioState } from "./store";

import styled from "styled-components";
import { IDivision } from "./types";

const Container = styled.div`
	background: limegreen;
	padding: 5px;
`;

const Row = styled.div`
	background: mediumaquamarine;
	padding: 5px;
	display: flex;
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
	padding: 5px;
	width: 100%;
	text-align: center;
`;

export class Matrix extends React.Component<IMatrixProps, IMatrixState> {
	constructor(props: IMatrixProps) {
		super(props);
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
								<Division>
									{division.subDenominatorArray.map(
										(zahl) => (
											<Onset>{zahl}</Onset>
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
