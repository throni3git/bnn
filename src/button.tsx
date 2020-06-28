import * as React from "react";

import styled from "styled-components";
import { COLORS } from "./constants";

const ButtonDiv = styled.div`
	background-color: ${COLORS.light};
	border: 1px solid ${COLORS.lightBorder};
	cursor: pointer;
	/* padding: 10px; */
	width: 52px;
	height: 52px;
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
`;

const ButtonInnerDiv = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

export const Button: React.SFC<IButtonProps> = (props) => (
	<ButtonDiv onClick={props.action}>
		<ButtonInnerDiv>{props.children}</ButtonInnerDiv>
	</ButtonDiv>
);

Button.displayName = "Button";

export default Button;

export interface IButtonProps {
	action: (event) => void;
}
