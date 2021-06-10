import * as React from "react";

function SvgButtonMinus(props: React.SVGProps<SVGSVGElement>) {
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
			<path fill="currentColor" d="M30.005 67.566h100v25h-100z" />
			<path
				d="M133.005 67.566c0-1.663-1.337-3-3-3h-100c-1.656 0-3 1.337-3 3v25c0 1.662 1.344 3 3 3h100c1.663 0 3-1.338 3-3v-25z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonMinus;
