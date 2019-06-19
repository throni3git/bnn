import {
	AudioContext,
	IGainNode,
	IAudioContext
} from "standardized-audio-context";

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

export class AudioMan {
	public audioCtx: AudioContext;
	public gainNode: IGainNode<IAudioContext>;

	constructor() {
		this.audioCtx = new AudioContext();
		this.gainNode = this.audioCtx.createGain();
		this.gainNode.gain.setValueAtTime(1, 0);
		this.gainNode.connect(this.audioCtx.destination);
	}

	public async load(drumset: IDrumset, basePath: string): Promise<void> {
		const allDrums = Object.keys(drumset);
		const loadingPromises = allDrums.map(instrument =>
			this.loadInstrument(drumset[instrument], basePath)
		);

		Promise.all(loadingPromises).then(loadedSamples => {
			console.log(loadedSamples);
			this.playInstrument(drumset.bd);
		});
	}

	private async loadInstrument(
		instrument: IDrumInstrument,
		basePath: string
	): Promise<void> {
		const result = await fetch(basePath + instrument.url);
		const buffer = await result.arrayBuffer();
		const decoded = await this.audioCtx.decodeAudioData(buffer);
		instrument.audioBuffer = decoded;
	}

	private playInstrument(instrument: IDrumInstrument): void {
		if (!instrument.audioBuffer) {
			return;
		}
		let source = this.audioCtx.createBufferSource(); // creates a sound source
		source.buffer = instrument.audioBuffer; // tell the source which sound to play
		source.connect(this.gainNode); // connect the source to the context's destination (the speakers)
		source.start(0); // play the source now
		// note: on older systems, may have to use deprecated noteOn(time);

		source.loop = true;
	}
}

export const audioManInstance = new AudioMan();
