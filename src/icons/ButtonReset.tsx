import * as React from "react";

function SvgButtonReset(props: React.SVGProps<SVGSVGElement>) {
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
			<path fill="none" d="M.004.069h160v160h-160z" />
			<path
				d="M49.933 52.949l-11.648-4.36a3.006 3.006 0 00-2.978.51 2.993 2.993 0 00-1.025 2.84l5.27 28.68a3.002 3.002 0 004.819 1.8l22.82-18.14a3.01 3.01 0 001.096-2.82 2.994 2.994 0 00-1.91-2.34l-10.323-3.87c6.209-5.99 14.652-9.68 23.95-9.68 19.04 0 34.5 15.46 34.5 34.5s-15.46 34.5-34.5 34.5c-1.656 0-3 1.35-3 3 0 1.66 1.344 3 3 3 22.353 0 40.5-18.14 40.5-40.5 0-22.35-18.147-40.5-40.5-40.5-11.927 0-22.657 5.17-30.071 13.38z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonReset;
