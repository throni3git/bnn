import * as React from "react";

import styled from "styled-components";

import { COLORS, UI_CONSTANTS } from "./constants";
import * as Types from "./types";
import * as Store from "./store";

const ButtonDiv = styled.div<{
	isDisabled?: boolean;
	isSmallDevice: boolean;
}>(
	(props) => `
	background-color: ${COLORS.light};
	// border: 2px solid ${COLORS.lightBorder};
	border-radius:${UI_CONSTANTS.br};
	opacity: ${props.isDisabled ? 0.5 : 1}
	cursor: pointer;
	/* padding: 10px; */
	height: 100%;
	width: 100%;
	max-width: ${props.isSmallDevice ? "42px" : "52px"};
	max-height: ${props.isSmallDevice ? "42px" : "52px"};
	min-width: ${props.isSmallDevice ? "32px" : "42px"};
	min-height: ${props.isSmallDevice ? "32px" : "42px"};
	margin: 4px;
	text-align: center;
	transition: background-color 0.05s linear;
	user-select: none;
	position: relative;

	&:hover {
		background-color: ${COLORS.lightHighlight};
	}

	&:active {
		background-color: ${COLORS.lightActive};
		transition: background-color 0.001s linear;
	}
	z-index: 2;
`
);

const ButtonInnerDiv = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

export const Button: React.FunctionComponent<IButtonProps> = (props) => {
	const deviceMode = Store.getState().ui.deviceMode;
	const isSmallDevice =
		deviceMode === Types.EDeviceMode.SmallPortrait ||
		deviceMode === Types.EDeviceMode.SmallLandscape;

	return (
		<ButtonDiv
			onClick={(event) => {
				if (props.disabled !== true) {
					props.action(event);
				}
			}}
			isDisabled={props.disabled}
			isSmallDevice={isSmallDevice}
		>
			<ButtonInnerDiv>{props.children}</ButtonInnerDiv>
		</ButtonDiv>
	);
};

Button.displayName = "Button";

export default Button;

export interface IButtonProps {
	action: (event) => void;
	disabled?: boolean;
}
