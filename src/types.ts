import { IGainNode, IAudioContext } from "standardized-audio-context";

export interface IDrumInstrument {
	url: string;
	audioBuffer?: AudioBuffer;
	gainNode?: IGainNode<IAudioContext>;
}

export const DrumsetKeyArray = <const>[
	"bd",
	"hho",
	"hhc",
	"sn",
	"tomHi",
	"tomMidHi",
	"tomMidLo",
	"tomLo",
];

export type DrumsetKeys = typeof DrumsetKeyArray[number];

export type IDrumset = Record<DrumsetKeys, IDrumInstrument>;

export interface IOnset {
	position: number;
	velocity: number;
	isPlanned: boolean;
	subEnumerator: number;
}

export interface IDivision {
	subDenominatorArray: number[];
}

export type IDrumLoop = {
	denominator: number;
	enumerator: number;
	measure: {
		[key in DrumsetKeys]?: string[];
	};
	compiledMeasure: {
		[key in DrumsetKeys]?: IOnset[];
	};
	metaMeasure: {
		[key in DrumsetKeys]?: IDivision[];
	};
};

export interface IOnsetUIUpdate {
	position: number;
	subEnumerator: number;
	enabled: boolean;
}
