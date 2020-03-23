import { Key } from "ts-keycode-enum";
import { increaseBpm, decreaseBpm, togglePlay } from "./util";

const keyHandler = (event: KeyboardEvent) => {
	switch (event.which) {
		case Key.Add: {
			increaseBpm();
			break;
		}
		case Key.Subtract: {
			decreaseBpm();
			break;
		}
		case Key.Space: {
			togglePlay();
			break;
		}
	}
};

export function registerGlobalKeyHandler(): void {
	window.addEventListener("keydown", keyHandler);
}
