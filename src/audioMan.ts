import { AudioContext } from "standardized-audio-context";

const audioCtx = new AudioContext();
export const oscillatorNode = audioCtx.createOscillator();

oscillatorNode.connect(audioCtx.destination);

export class AudioMan {
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
		return audioCtx.decodeAudioData(buffer);
	}

	private playSound(buffer) {
		let source = audioCtx.createBufferSource(); // creates a sound source
		source.buffer = buffer; // tell the source which sound to play
		source.connect(audioCtx.destination); // connect the source to the context's destination (the speakers)
		source.start(0); // play the source now
		// note: on older systems, may have to use deprecated noteOn(time);

		source.loop = true;
	}
}

export const audioManInstance = new AudioMan();
