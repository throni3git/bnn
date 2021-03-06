// https://electronjs.org/docs/tutorial/first-app
// https://entwickler.de/online/javascript/electron-react-desktopanwendungen-579896835.html

const { app, BrowserWindow } = require("electron");

let win;

function createWindow() {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		minHeight: 640,
		minWidth: 360,
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: "#1a1a1a" // hexadezimal von hsl(172, 0%, 10%) vom dark theme
	});

	win.loadFile("dist/index.html");

	win.removeMenu();

	// win.webContents.openDevTools();

	win.on("closed", () => {
		win = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});
