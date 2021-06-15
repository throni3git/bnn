import * as React from "react";

function SvgButtonPlus(props: React.SVGProps<SVGSVGElement>) {
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
			<path fill="none" d="M.005.06h160v160h-160z" />
			<path
				d="M92.505 67.559v-37.5h-25v37.5h-37.5v25h37.5v37.5h25v-37.5h37.5v-25h-37.5z"
				fill="currentColor"
			/>
			<path
				d="M95.505 64.559v-34.5c0-1.663-1.337-3-3-3h-25c-1.656 0-3 1.337-3 3v34.5h-34.5c-1.656 0-3 1.337-3 3v25c0 1.662 1.344 3 3 3h34.5v34.5c0 1.662 1.344 3 3 3h25c1.663 0 3-1.338 3-3v-34.5h34.5c1.663 0 3-1.338 3-3v-25c0-1.663-1.337-3-3-3h-34.5z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonPlus;
