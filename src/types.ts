import { IGainNode, IAudioContext } from "standardized-audio-context";

export interface IDrumInstrument {
	url: string;
	audioBuffer?: AudioBuffer;
	gainNode?: IGainNode<IAudioContext>;
}

// export interface IDrumset {
// 	bd?: IDrumInstrument;
// 	hho?: IDrumInstrument;
// 	hhc?: IDrumInstrument;
// 	sn?: IDrumInstrument;
// 	tomHi?: IDrumInstrument;
// 	tomMidHi?: IDrumInstrument;
// 	tomMidLo?: IDrumInstrument;
// 	tomLo?: IDrumInstrument;
// }

export const DrumsetKeyArray = <const>[
	"bd",
	"hho",
	"hhc",
	"sn",
	"tomHi",
	"tomMidHi",
	"tomMidLo",
	"tomLo"
];

export type DrumsetKeys = typeof DrumsetKeyArray[number];

export type IDrumset = Record<DrumsetKeys, IDrumInstrument>;

// const furniture = <const>["chair", "table", "lamp"];
// type Furniture = typeof furniture[number];

// export type DrumsetKeys = keyof IDrumset;

export type IDrumLoop = {
	denominator: number;
	enumerator: number;
	measure: {
		[key in DrumsetKeys]?: string[];
	};
};
