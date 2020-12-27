import { Key } from "ts-keycode-enum";

import * as Utils from "./util";

const keyHandler = (event: KeyboardEvent) => {
	switch (event.which) {
		case Key.Add: {
			Utils.increaseBpm();
			break;
		}
		case Key.Subtract: {
			Utils.decreaseBpm();
			break;
		}
		case Key.Space: {
			Utils.togglePlay();
			break;
		}
		case Key.UpArrow: {
			Utils.increaseVolume();
			break;
		}
		case Key.DownArrow: {
			Utils.decreaseVolume();
			break;
		}
		case Key.RightArrow: {
			Utils.increaseBpm();
			break;
		}
		case Key.LeftArrow: {
			Utils.decreaseBpm();
			break;
		}
	}
};

export function registerGlobalKeyHandler(): void {
	window.addEventListener("keydown", keyHandler);
}
