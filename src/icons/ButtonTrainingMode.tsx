import * as React from "react";

function SvgButtonTrainingMode(props: React.SVGProps<SVGSVGElement>) {
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
			<path fill="none" d="M-.004.06h160v160h-160z" />
			<path
				d="M67.496 85.851L57.68 66.22a3.002 3.002 0 00-5.368 0l-25 50a3 3 0 002.684 4.341h100a3 3 0 002.684-4.341l-37.5-75a3.002 3.002 0 00-5.368 0L67.496 85.85z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonTrainingMode;
