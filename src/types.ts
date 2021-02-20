import { IGainNode, IAudioContext } from "standardized-audio-context";

export enum EDeviceMode {
	Desktop = "Desktop",
	SmallPortrait = "SmallPortrait", // smartphone
	SmallLandscape = "SmallLandscape",
	BigPortrait = "BigPortrait", // tablet
	BigLandscape = "BigLandscape",
}

export enum EDisplayMode {
	Play = "Play",
	Metrics = "Metrics",
	Volume = "Volume",
	Settings = "Settings",
}

export interface IDrumInstrument {
	url: string;
	audioBuffer?: AudioBuffer;
	gainNode?: IGainNode<IAudioContext>;
}

export const DrumsetKeyArray = <const>[
	"tomHi",
	"tomMidHi",
	"tomMidLo",
	"tomLo",
	"hho",
	"hhc",
	"sn",
	"bd",
];

export type DrumsetKeys = typeof DrumsetKeyArray[number];

export type IDrumset = Record<DrumsetKeys, IDrumInstrument>;

export interface IOnset {
	position: number;
	velocity: number;
	isPlanned: boolean;
	subEnumerator: number;
}

export interface IBeat {
	onsets: IOnset[];
}

export type IDrumLoop = {
	denominator: number;
	enumerator: number;
	textBeats: {
		[key in DrumsetKeys]?: string[];
	};
	compiledBeats: {
		[key in DrumsetKeys]?: IBeat[];
	};
};

export interface IOnsetUIUpdate {
	position: number;
	subEnumerator: number;
	enabled: boolean;
}
