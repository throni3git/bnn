import * as ReactDOM from "react-dom";
import * as React from "react";

import { BeatronomeApp } from "./beatronomeApp";

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

ReactDOM.render(React.createElement(BeatronomeApp), appMount);
