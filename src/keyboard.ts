import { Key } from "ts-keycode-enum";
import { increaseBpm, decreaseBpm } from "./util";

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
	}
};

export function registerGlobalKeyHandler(): void {
	window.addEventListener("keydown", keyHandler);
}
