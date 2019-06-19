import { AudioContext } from "standardized-audio-context";

const audioCtx = new AudioContext();
export const oscillatorNode = audioCtx.createOscillator();

oscillatorNode.connect(audioCtx.destination);

// oscillatorNode.start();
