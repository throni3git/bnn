import * as ReactDOM from "react-dom";
import * as React from "react";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
	faPlusCircle,
	faMinusCircle,
	faPlayCircle,
	faStopCircle,
	faHandPointUp,
	faUndo,
	faPlus,
	faMinus,
} from "@fortawesome/free-solid-svg-icons";

import { BeatronomeApp } from "./beatronomeApp";

import { registerGlobalKeyHandler } from "./keyboard";
import { COLORS } from "./constants";

declare var BUILD_TIMESTAMP: string;
declare var IS_PRODUCTION: boolean;
console.log("Beatronome " + BUILD_TIMESTAMP + (IS_PRODUCTION ? "" : " DEBUG"));

// progressive web app service worker

if (IS_PRODUCTION && "serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("service-worker.js")
			.then((registration) => {
				console.log("SW registered: ", registration);
			})
			.catch((registrationError) => {
				console.log("SW registration failed: ", registrationError);
			});
	});
}

library.add(
	faPlusCircle,
	faMinusCircle,
	faPlus,
	faMinus,
	faPlayCircle,
	faStopCircle,
	faHandPointUp,
	faUndo
);

// global styles

const html = document.getElementsByTagName("html")[0];
html.style.margin = "0";
html.style.width = "100%";
html.style.height = "100%";

const body = document.getElementsByTagName("body")[0];
body.style.margin = "0";
body.style.width = "100%";
body.style.height = "100%";
body.style.fontFamily = "sans-serif";
body.style.fontSize = "1em";
body.style.backgroundColor = COLORS.bg;
body.style.color = COLORS.fc;

const appMount = document.createElement("div");
appMount.style.width = "100%";
appMount.style.height = "100%";
appMount.style.display = "flex";
appMount.style.justifyContent = "center";
appMount.style.alignItems = "center";

body.appendChild(appMount);

registerGlobalKeyHandler();

ReactDOM.render(React.createElement(BeatronomeApp), appMount);
