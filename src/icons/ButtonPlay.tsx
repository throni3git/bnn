import * as React from "react";

function SvgButtonPlay(props: React.SVGProps<SVGSVGElement>) {
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
			<path fill="none" d="M.002.06h160v160h-160z" />
			<path
				d="M117.272 80.061l-62.499 37.5v-75l62.499 37.5z"
				fill="currentColor"
			/>
			<path
				d="M118.816 82.634a2.985 2.985 0 001.455-2.573c0-1.054-.544-2.03-1.455-2.573l-62.498-37.5a2.992 2.992 0 00-3.017-.038 2.992 2.992 0 00-1.527 2.61v75.001c0 1.081.58 2.078 1.527 2.61a2.992 2.992 0 003.017-.038l62.498-37.5z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonPlay;
