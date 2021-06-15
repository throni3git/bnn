import * as React from "react";

function SvgButtonEditMode(props: React.SVGProps<SVGSVGElement>) {
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
				d="M47.741 99.819a3.01 3.01 0 00-2.81-.8 3.014 3.014 0 00-2.157 1.97l-6.25 18.75a2.997 2.997 0 00.725 3.07 2.987 2.987 0 003.07.73l18.75-6.25a3.002 3.002 0 001.172-4.97l-12.5-12.5zm47.366-47.36a2.984 2.984 0 00-4.242 0L52.47 90.849a2.998 2.998 0 000 4.24l12.5 12.5a3.003 3.003 0 004.243 0l38.395-38.39a2.996 2.996 0 000-4.24l-12.5-12.5zm15.134-15.14a3.002 3.002 0 00-4.242 0l-6.25 6.25a2.996 2.996 0 000 4.24l12.5 12.5a2.984 2.984 0 004.242 0l6.25-6.25a2.996 2.996 0 000-4.24l-12.5-12.5z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default SvgButtonEditMode;
