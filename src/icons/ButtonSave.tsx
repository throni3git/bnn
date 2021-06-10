import * as React from "react";

function SvgButtonSave(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 160 161"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
			strokeLinejoin="round"
			strokeMiterlimit={2}
			{...props}
		>
			<path fill="none" d="M0 .06h159.999v160h-160z" />
			<path
				d="M133 50.061a3 3 0 00-.88-2.12l-20-20a3.01 3.01 0 00-2.12-.88H30c-1.658 0-3 1.35-3 3v100c0 1.66 1.342 3 3 3h100c1.656 0 3-1.34 3-3v-80zm-30-17v32c0 1.66-1.344 3-3 3H50c-1.658 0-3-1.34-3-3v-32H33v94h9v-47c0-1.65 1.342-3 3-3h70c1.656 0 3 1.35 3 3v47h9v-75.75l-18.244-18.25H103zm-55 50h64v44H48v-44zm30-47.5h16.5v24H78v-24z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonSave;
