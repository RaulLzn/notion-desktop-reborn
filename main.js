const { app, BrowserWindow, shell } = require("electron");
const { registerMenuHandling, toggleMenuBar } = require("./menuBarHandling");

app.on("ready", () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      spellcheck: false
    }
  });
  win.maximize();
  win.loadURL("https://notion.so");

  registerMenuHandling(win);

  // Deal with external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("https://www.notion.so")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
});
