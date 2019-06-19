import {
	AudioContext,
	IGainNode,
	IAudioContext
} from "standardized-audio-context";

export class AudioMan {
	public audioCtx: AudioContext;
	public gainNode: IGainNode<IAudioContext>;

	constructor() {
		this.audioCtx = new AudioContext();
		this.gainNode = this.audioCtx.createGain();
		this.gainNode.gain.setValueAtTime(1, 0);
		this.gainNode.connect(this.audioCtx.destination);
	}

	public load() {
		Promise.all([
			this.loadSample("assets/samples/hydro/bd.mp3"),
			this.loadSample("assets/samples/hydro/hho.mp3"),
			this.loadSample("assets/samples/hydro/hhc.mp3"),
			this.loadSample("assets/samples/hydro/sn.mp3")
		]).then(loadedSamples => {
			console.log(loadedSamples);
			this.playSound(loadedSamples[0]);
		});
	}

	private async loadSample(url: string) {
		const result = await fetch(url);
		const buffer = await result.arrayBuffer();
		return this.audioCtx.decodeAudioData(buffer);
	}

	private playSound(buffer) {
		let source = this.audioCtx.createBufferSource(); // creates a sound source
		source.buffer = buffer; // tell the source which sound to play
		source.connect(this.gainNode); // connect the source to the context's destination (the speakers)
		source.start(0); // play the source now
		// note: on older systems, may have to use deprecated noteOn(time);

		source.loop = true;
	}
}

export const audioManInstance = new AudioMan();
