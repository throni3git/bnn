import * as React from "react";

import styled from "styled-components";

import { COLORS } from "./constants";
import * as Types from "./types";
import * as Store from "./store";

const ButtonDiv = styled.div<{
	isDisabled?: boolean;
	deviceMode: Types.EDeviceMode;
}>(
	(props) => `
	background-color: ${COLORS.light};
	border: 2px solid ${COLORS.lightBorder};
	border-radius: 1em;
	opacity: ${props.isDisabled ? 0.5 : 1}
	cursor: pointer;
	/* padding: 10px; */
	width: ${
		props.deviceMode === Types.EDeviceMode.SmallPortrait ||
		props.deviceMode === Types.EDeviceMode.SmallLandscape
			? "42px"
			: "52px"
	};
	height: ${
		props.deviceMode === Types.EDeviceMode.SmallPortrait ||
		props.deviceMode === Types.EDeviceMode.SmallLandscape
			? "42px"
			: "52px"
	};
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
`
);

const ButtonInnerDiv = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

export const Button: React.FunctionComponent<IButtonProps> = (props) => (
	<ButtonDiv
		onClick={(event) => {
			if (props.disabled !== true) {
				props.action(event);
			}
		}}
		isDisabled={props.disabled}
		deviceMode={Store.getState().ui.deviceMode}
	>
		<ButtonInnerDiv>{props.children}</ButtonInnerDiv>
	</ButtonDiv>
);

Button.displayName = "Button";

export default Button;

export interface IButtonProps {
	action: (event) => void;
	disabled?: boolean;
}
