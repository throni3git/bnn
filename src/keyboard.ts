import * as Utils from "./util";

const keyHandler = (event: KeyboardEvent) => {
	switch (event.key) {
		case "+": {
			Utils.increaseBpm();
			break;
		}
		case "-": {
			Utils.decreaseBpm();
			break;
		}
		case " ": {
			Utils.togglePlay();
			break;
		}
		case "ArrowUp": {
			Utils.increaseVolume();
			break;
		}
		case "ArrowDown": {
			Utils.decreaseVolume();
			break;
		}
		case "ArrowRight": {
			Utils.increaseBpm();
			break;
		}
		case "ArrowLeft": {
			Utils.decreaseBpm();
			break;
		}
	}
};

export function registerGlobalKeyHandler(): void {
	window.addEventListener("keydown", keyHandler);
}
