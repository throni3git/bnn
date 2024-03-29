const LIGHT_THEME = {
	bg: "hsl(0, 0%, 100%)",
	fc: "hsl(0, 0%, 30%)",
	light: "hsl(0, 0%, 90%)",
	lightBorder: "hsl(0, 0%, 75%)",
	lightHighlight: "hsl(0, 0%, 60%)",
	lightActive: "hsl(0, 0%, 50%)",
};

const DARK_THEME = {
	bg: "hsl(172, 0%, 10%)",
	fc: "hsl(172, 57%, 45%)",
	light: "hsl(172, 57%, 10%)",
	lightBorder: "hsl(172, 57%, 15%)",
	lightHighlight: "hsl(172, 57%, 20%)",
	lightActive: "hsl(172, 57%, 25%)",
};

export let COLORS = LIGHT_THEME;

export const UI_CONSTANTS = {
	br: "0.5em", // border-radius
};

export const DIR_ASSETS = "assets/";
export const DIR_DRUMSETS = DIR_ASSETS + "drumsets/";
export const DIR_LOOPS = DIR_ASSETS + "loops/";

export const LOOP_UPDATE_INTERVAL = 0.1;
