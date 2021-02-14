import * as React from "react";

import styled from "styled-components";

import { EDeviceMode } from "./types";
import { COLORS, UI_CONSTANTS } from "./constants";

declare var IS_PRODUCTION: boolean;

export const AllDiv = styled.div<{ deviceMode: EDeviceMode }>(
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
`
);

// border: ${
// 	props.deviceMode === EDeviceMode.Desktop
// 		? "2px solid " + COLORS.lightBorder
// 		: null
// };

export const Heading = styled.div`
	font-size: 2em;
	font-weight: bold;
	justify-content: center;
	text-align: center;
	padding-top: 4px;
`;

export const ContainerDiv = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	justify-content: space-evenly;
	padding: 4px;
`;

export const SliderPadding = styled.div`
	display: flex;
	flex: 1;
	padding: 10px;
`;

export const FlexRow = styled.div`
	/* border: 1px dotted red; */
	display: flex;
	flex: 1;
	flex-direction: row;
	justify-content: center;
`;

export const Row = styled.div`
	/* border: 1px dotted red; */
	display: flex;
	/* flex: 1; */
	flex-direction: row;
	justify-content: space-evenly;
`;

export const FixedRow = styled.div`
	/* border: 1px dotted darkred; */
	/* min-height: 40px; */
	display: flex;
`;

export const Column = styled.div`
	/* border: 1px dotted green; */
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: center;
`;

export const FixedColumn = styled.div<{ deviceMode: EDeviceMode }>(
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

export const RangeTrackHorizontal = styled.div`
	height: 20px;
	width: calc(100% - 20px);
	margin: auto;
	position: relative;

	&::before {
		content: "";
		background-color: ${COLORS.light};
		border: 2px solid ${COLORS.lightBorder};
		border-radius: ${UI_CONSTANTS.br};
		display: block;
		width: calc(100% + 20px);
		height: 20px;
		transform: translateX(-10px);
		position: absolute;
	}
`;

export const RangeTrackVertical = styled.div`
	height: calc(100% - 20px);
	width: 20px;
	margin: auto;

	&::before {
		content: "";
		background-color: ${COLORS.light};
		border: 2px solid ${COLORS.lightBorder};
		border-radius: ${UI_CONSTANTS.br};
		display: block;
		width: 20px;
		height: calc(100% + 20px);
		transform: translateY(-10px);
		position: absolute;
	}
`;

export const createRangeThumb = ({ props }) => (
	<div
		{...props}
		style={{
			...props.style,
			height: "20px",
			width: "20px",
			borderRadius: UI_CONSTANTS.br,
			backgroundColor: COLORS.fc,
		}}
	/>
);

export const CenteredSmall = styled.div`
	font-size: 0.7em;
	text-align: center;
`;

export const CenteredLarge = styled.div`
	font-size: 2em;
	font-weight: bold;
	text-align: center;
`;
