import * as React from "react";

import styled from "styled-components";
import { COLORS } from "./colors";

const ButtonDiv = styled.div`
	background: ${COLORS.light};
	border: 1px solid ${COLORS.lightBorder};
	cursor: pointer;
	padding: 6px;
	margin: 4px;
	text-align: center;
	user-select: none;

	&:hover {
		background: ${COLORS.lightHighlight};
	}
`;

export const Button: React.SFC<IButtonProps> = props => (
	<ButtonDiv onClick={props.action}>{props.caption}</ButtonDiv>
);

Button.displayName = "Button";

export default Button;

export interface IButtonProps {
	action: (event) => void;
	caption: string;
}
