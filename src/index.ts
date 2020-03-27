import * as ReactDOM from "react-dom";
import * as React from "react";

import { BeatronomeApp } from "./beatronomeApp";

import { registerGlobalKeyHandler } from "./keyboard";

declare var BUILD_TIMESTAMP: string;
console.log("Beatronome " + BUILD_TIMESTAMP);

export let PRODUCTION = process.env.NODE_ENV == "production";

// progressive web app service worker

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/service-worker.js")
			.then(registration => {
				console.log("SW registered: ", registration);
			})
			.catch(registrationError => {
				console.log("SW registration failed: ", registrationError);
			});
	});
}

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
body.style.fontSize = "0.8em";

const appMount = document.createElement("div");
appMount.style.width = "100%";
appMount.style.height = "100%";
appMount.style.overflow = "hidden";

body.appendChild(appMount);

registerGlobalKeyHandler();

ReactDOM.render(React.createElement(BeatronomeApp), appMount);
