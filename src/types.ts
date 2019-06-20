export interface IDrumInstrument {
	url: string;
	audioBuffer?: AudioBuffer;
}

export interface IDrumset {
	bd?: IDrumInstrument;
	hho?: IDrumInstrument;
	hhc?: IDrumInstrument;
	sn?: IDrumInstrument;
	tomHi?: IDrumInstrument;
	tomMidHi?: IDrumInstrument;
	tomMidLo?: IDrumInstrument;
	tomLo?: IDrumInstrument;
}

export type DrumsetKeys = keyof IDrumset;
