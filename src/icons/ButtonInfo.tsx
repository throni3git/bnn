import * as React from "react";

function SvgButtonInfo(props: React.SVGProps<SVGSVGElement>) {
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
				d="M71.052 68.47v60.52H88.73V68.47H71.052zm0-37.33v17.87h17.9V31.14h-17.9z"
				fill="currentColor"
			/>
			<path
				d="M71.052 65.47c-1.657 0-3 1.34-3 3v60.52c0 1.66 1.343 3 3 3H88.73c1.657 0 3-1.34 3-3V68.47c0-1.66-1.343-3-3-3H71.052zm0-37.33c-1.657 0-3 1.34-3 3v17.87c0 1.66 1.343 3 3 3h17.9c1.657 0 3-1.34 3-3V31.14c0-1.66-1.343-3-3-3h-17.9z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonInfo;
