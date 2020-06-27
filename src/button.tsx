import * as React from "react";

import styled from "styled-components";
import { COLORS } from "./constants";

const ButtonDiv = styled.div`
	background-color: ${COLORS.light};
	border: 1px solid ${COLORS.lightBorder};
	cursor: pointer;
	padding: 10px;
	width: 32px;
	height: 32px;
	margin: 4px;
	text-align: center;
	transition: background-color 0.05s linear;
	user-select: none;

	&:hover {
		background-color: ${COLORS.lightHighlight};
	}

	&:active {
		background-color: ${COLORS.lightActive};
		transition: background-color 0.001s linear;
	}
`;

export const Button: React.SFC<IButtonProps> = (props) => (
	<ButtonDiv onClick={props.action}>{props.children}</ButtonDiv>
);

Button.displayName = "Button";

export default Button;

export interface IButtonProps {
	action: (event) => void;
}
