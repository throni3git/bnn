import * as React from "react";

function SvgButtonMenu(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 100 101"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
			strokeLinejoin="round"
			strokeMiterlimit={2}
			{...props}
		>
			<path fill="none" d="M-.004.069h100v100h-100z" />
			<path
				d="M82.495 72.558a2.5 2.5 0 00-2.5-2.5h-60a2.5 2.5 0 00-2.5 2.5v5a2.5 2.5 0 002.5 2.5h60a2.5 2.5 0 002.5-2.5v-5zm0-25a2.5 2.5 0 00-2.5-2.5h-60a2.5 2.5 0 00-2.5 2.5v5a2.5 2.5 0 002.5 2.5h60a2.5 2.5 0 002.5-2.5v-5zm0-25a2.5 2.5 0 00-2.5-2.5h-60a2.5 2.5 0 00-2.5 2.5v5a2.5 2.5 0 002.5 2.5h60a2.5 2.5 0 002.5-2.5v-5z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonMenu;
