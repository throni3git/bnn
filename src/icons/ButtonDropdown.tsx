import * as React from "react";

function SvgButtonDropdown(props: React.SVGProps<SVGSVGElement>) {
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
			<path fill="none" d="M.002.061h160v160h-160z" />
			<path
				d="M77.881 132.187a3.003 3.003 0 004.243 0l37.5-37.5a3 3 0 00-2.122-5.12h-75a2.999 2.999 0 00-2.12 5.12l37.499 37.5zm4.243-104.24a2.985 2.985 0 00-4.243 0l-37.5 37.5a2.981 2.981 0 00-.65 3.26 3.008 3.008 0 002.771 1.86h75c1.214 0 2.308-.74 2.772-1.86a2.983 2.983 0 00-.65-3.26l-37.5-37.5z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonDropdown;
