import { Key } from "ts-keycode-enum";
import {
	increaseBpm,
	decreaseBpm,
	togglePlay,
	increaseVolume,
	decreaseVolume
} from "./util";

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
		case Key.UpArrow: {
			increaseVolume();
			break;
		}
		case Key.DownArrow: {
			decreaseVolume();
			break;
		}
	}
};

export function registerGlobalKeyHandler(): void {
	window.addEventListener("keydown", keyHandler);
}
