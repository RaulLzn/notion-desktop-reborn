const { app, BrowserWindow, shell, session, Menu, ipcMain, BrowserView, nativeTheme } = require("electron");
const path = require('path');

// Fix GTK conflicts on Linux
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-gpu-sandbox');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
  app.commandLine.appendSwitch('--disable-extensions');
}

// Helper function to get the active content view
const getActiveContentView = (browserWindow) => {
  if (!browserWindow || !browserWindow.contentViews || browserWindow.activeTabIndex < 0) {
    return null;
  }
  return browserWindow.contentViews[browserWindow.activeTabIndex];
};

// Create application menu with keyboard shortcuts
const createApplicationMenu = () => {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    
    // File menu
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva pestaña',
          accelerator: 'CmdOrCtrl+T',
          click: (menuItem, browserWindow) => {
            if (browserWindow) {
              createNewTab(browserWindow);
            }
          }
        },
        {
          label: 'Cerrar pestaña',
          accelerator: 'CmdOrCtrl+W',
          click: (menuItem, browserWindow) => {
            if (browserWindow && browserWindow.contentViews && browserWindow.contentViews.length > 1) {
              closeTab(browserWindow, browserWindow.activeTabIndex);
            } else if (browserWindow) {
              browserWindow.close();
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    
    // View menu
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Siguiente pestaña',
          accelerator: 'CmdOrCtrl+Tab',
          click: (menuItem, browserWindow) => {
            if (browserWindow && browserWindow.contentViews && browserWindow.contentViews.length > 1) {
              switchToNextTab(browserWindow);
            }
          }
        },
        {
          label: 'Pestaña anterior',
          accelerator: 'CmdOrCtrl+Shift+Tab',
          click: (menuItem, browserWindow) => {
            if (browserWindow && browserWindow.contentViews && browserWindow.contentViews.length > 1) {
              switchToPreviousTab(browserWindow);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Redimensionar vistas',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: (menuItem, browserWindow) => {
            if (browserWindow && browserWindow.contentViews) {
              forceResizeAllViews(browserWindow);
            }
          }
        },
        { role: 'togglefullscreen' }
      ]
    },
    
    // Window menu
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
};

const createWindow = () => {
  const win = new BrowserWindow({
    autoHideMenuBar: false,
    icon: __dirname + "/build/icons/icon.png",
    webPreferences: {
      spellcheck: false,
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  win.maximize();
  
  // Create tab bar view
  const tabBarView = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  
  // Create main content view
  const contentView = new BrowserView({
    webPreferences: {
      spellcheck: false,
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });
  
  // Add views to window
  win.addBrowserView(tabBarView);
  win.addBrowserView(contentView);
  
  // Set initial bounds
  const bounds = win.getContentBounds();
  const tabBarHeight = 40;
  
  tabBarView.setBounds({ x: 0, y: 0, width: bounds.width, height: tabBarHeight });
  contentView.setBounds({ x: 0, y: tabBarHeight, width: bounds.width, height: bounds.height - tabBarHeight });
  
  // Load tab bar
  tabBarView.webContents.loadFile(path.join(__dirname, 'tab-bar.html'));
  
  // Load Notion in content view
  const linuxUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  session.defaultSession.setUserAgent(linuxUserAgent);
  contentView.webContents.setUserAgent(linuxUserAgent);
  contentView.webContents.loadURL("https://notion.so", { userAgent: linuxUserAgent });

  // Apply theme to content view
  applyThemeToView(contentView.webContents);

  // Store references
  win.tabBarView = tabBarView;
  win.contentView = contentView;
  win.contentViews = [contentView]; // Array to store all content views
  win.activeTabIndex = 0;
  
  // Function to resize all views properly
  const resizeAllViews = () => {
    const newBounds = win.getContentBounds();
    const tabBarHeight = 40;
    
    // Resize tab bar
    tabBarView.setBounds({ x: 0, y: 0, width: newBounds.width, height: tabBarHeight });
    
    // Resize all content views (not just active one)
    win.contentViews.forEach((view, index) => {
      if (view) {
        view.setBounds({ 
          x: 0, 
          y: tabBarHeight, 
          width: newBounds.width, 
          height: newBounds.height - tabBarHeight 
        });
      }
    });
    
    console.log(`📐 Resized all views to: ${newBounds.width}x${newBounds.height}`);
  };
  
  // Handle window resize
  win.on('resize', resizeAllViews);
  
  // Handle enter/leave fullscreen
  win.on('enter-full-screen', () => {
    console.log('🖥️ Entering fullscreen mode');
    setTimeout(resizeAllViews, 100); // Small delay to ensure proper dimensions
  });
  
  win.on('leave-full-screen', () => {
    console.log('🖥️ Leaving fullscreen mode');
    setTimeout(resizeAllViews, 100); // Small delay to ensure proper dimensions
  });
  
  // Handle maximize/unmaximize
  win.on('maximize', () => {
    console.log('📏 Window maximized');
    setTimeout(resizeAllViews, 50);
  });
  
  win.on('unmaximize', () => {
    console.log('📏 Window unmaximized');
    setTimeout(resizeAllViews, 50);
  });

  return win;
};

// Function to create a new tab
const createNewTab = (parentWindow, url = "https://notion.so") => {
  const newContentView = new BrowserView({
    webPreferences: {
      spellcheck: false,
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  // Add to content views array
  parentWindow.contentViews.push(newContentView);
  
  // Set user agent and load the URL
  const linuxUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  newContentView.webContents.setUserAgent(linuxUserAgent);
  newContentView.webContents.loadURL(url, { userAgent: linuxUserAgent });
  
  // Apply theme to new content view
  applyThemeToView(newContentView.webContents);
  
  // Switch to the new tab
  switchToTab(parentWindow, parentWindow.contentViews.length - 1);
  
  // Handle window open events for this tab
  newContentView.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
    console.log('Tab window open request:', { url, frameName, disposition });
    
    if (url.startsWith("https://www.notion.so") || url.startsWith("https://notion.so")) {
      if (disposition === 'new-window' || disposition === 'foreground-tab' || disposition === 'background-tab') {
        createNewTab(parentWindow, url);
        return { action: "deny" };
      }
      return { action: "allow" };
    } else {
      shell.openExternal(url);
      return { action: "deny" };
    }
  });

  console.log(`✨ Created new tab for: ${url}`);
  console.log(`📋 Total tabs: ${parentWindow.contentViews.length}`);
  
  // Update tab bar
  updateTabBar(parentWindow);
};

// Function to close a tab
const closeTab = (parentWindow, tabIndex) => {
  if (!parentWindow.contentViews || parentWindow.contentViews.length <= 1 || tabIndex < 0 || tabIndex >= parentWindow.contentViews.length) {
    return; // Don't close if it's the only tab or invalid index
  }

  const viewToClose = parentWindow.contentViews[tabIndex];
  
  // Remove the view from window
  parentWindow.removeBrowserView(viewToClose);
  viewToClose.webContents.destroy();

  // Remove from content views array
  parentWindow.contentViews.splice(tabIndex, 1);
  
  // Adjust active tab index
  if (parentWindow.activeTabIndex >= parentWindow.contentViews.length) {
    parentWindow.activeTabIndex = parentWindow.contentViews.length - 1;
  } else if (parentWindow.activeTabIndex >= tabIndex) {
    parentWindow.activeTabIndex = Math.max(0, parentWindow.activeTabIndex - 1);
  }
  
  // Switch to the new active tab
  switchToTab(parentWindow, parentWindow.activeTabIndex);
  
  console.log(`🗑️ Closed tab ${tabIndex + 1}. Remaining tabs: ${parentWindow.contentViews.length}`);
  updateTabBar(parentWindow);
};

// Function to switch to next tab
const switchToNextTab = (parentWindow) => {
  if (!parentWindow.contentViews || parentWindow.contentViews.length <= 1) return;
  
  const nextIndex = (parentWindow.activeTabIndex + 1) % parentWindow.contentViews.length;
  switchToTab(parentWindow, nextIndex);
};

// Function to switch to previous tab
const switchToPreviousTab = (parentWindow) => {
  if (!parentWindow.contentViews || parentWindow.contentViews.length <= 1) return;
  
  const prevIndex = parentWindow.activeTabIndex === 0 
    ? parentWindow.contentViews.length - 1 
    : parentWindow.activeTabIndex - 1;
  switchToTab(parentWindow, prevIndex);
};

// Function to switch to a specific tab
const switchToTab = (parentWindow, tabIndex) => {
  if (!parentWindow.contentViews || tabIndex < 0 || tabIndex >= parentWindow.contentViews.length) return;
  
  const tabBarHeight = 40;
  const bounds = parentWindow.getContentBounds();
  
  // Hide current view
  const currentView = parentWindow.contentViews[parentWindow.activeTabIndex];
  if (currentView && parentWindow.getBrowserViews().includes(currentView)) {
    parentWindow.removeBrowserView(currentView);
  }
  
  // Show new view with correct dimensions
  const newView = parentWindow.contentViews[tabIndex];
  if (newView) {
    parentWindow.addBrowserView(newView);
    // Ensure the view uses the full current window dimensions
    newView.setBounds({ x: 0, y: tabBarHeight, width: bounds.width, height: bounds.height - tabBarHeight });
    
    parentWindow.activeTabIndex = tabIndex;
    
    console.log(`🔄 Switched to tab ${tabIndex + 1} of ${parentWindow.contentViews.length} (${bounds.width}x${bounds.height})`);
    updateTabBar(parentWindow);
  }
};

// Function to update window title with tab info
const updateWindowTitle = (parentWindow) => {
  const activeView = parentWindow.contentViews[parentWindow.activeTabIndex];
  const tabCount = parentWindow.contentViews.length;
  const title = activeView ? activeView.webContents.getTitle() : 'Notion';
  
  if (tabCount > 1) {
    parentWindow.setTitle(`${title} (${parentWindow.activeTabIndex + 1}/${tabCount}) - Notion`);
  } else {
    parentWindow.setTitle(`${title} - Notion`);
  }
};

// Function to get tab information
const getTabsInfo = (parentWindow) => {
  const tabs = parentWindow.contentViews.map((view, index) => ({
    title: view.webContents.getTitle() || 'Loading...',
    url: view.webContents.getURL() || 'about:blank',
    isActive: index === parentWindow.activeTabIndex
  }));
  
  console.log(`📋 Getting tabs info: ${tabs.length} tabs`, tabs.map(t => t.title));
  return tabs;
};

// Function to update tab bar
const updateTabBar = (parentWindow) => {
  if (!parentWindow.tabBarView || !parentWindow.tabBarView.webContents) {
    console.log('❌ No tab bar view available');
    return;
  }
  
  const tabs = getTabsInfo(parentWindow);
  console.log(`🔄 Updating tab bar with ${tabs.length} tabs, active: ${parentWindow.activeTabIndex}`);
  
  parentWindow.tabBarView.webContents.send('update-tabs', tabs, parentWindow.activeTabIndex);
  updateWindowTitle(parentWindow);
};

// IPC handlers for tab management
ipcMain.on('get-tabs', (event) => {
  console.log('📨 Received get-tabs request');
  const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
  if (parentWindow) {
    console.log(`🔍 Found parent window with ${parentWindow.contentViews.length} content views`);
    const tabs = getTabsInfo(parentWindow);
    console.log('📤 Sending tabs to tab bar:', tabs);
    event.reply('update-tabs', tabs, parentWindow.activeTabIndex);
  } else {
    console.log('❌ Could not find parent window for get-tabs request');
  }
});

ipcMain.on('new-tab', (event) => {
  const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
  if (parentWindow) {
    createNewTab(parentWindow);
  }
});

ipcMain.on('close-tab', (event, tabIndex) => {
  const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
  if (parentWindow) {
    closeTab(parentWindow, tabIndex);
  }
});

ipcMain.on('switch-tab', (event, tabIndex) => {
  const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
  if (parentWindow) {
    switchToTab(parentWindow, tabIndex);
  }
});

ipcMain.on('force-resize', (event) => {
  const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
  if (parentWindow) {
    forceResizeAllViews(parentWindow);
  }
});

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Set application menu
  const applicationMenu = createApplicationMenu();
  Menu.setApplicationMenu(applicationMenu);

  const mainWindow = createWindow();
  
  // Handle new window requests for the main content view
  mainWindow.contentView.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
    console.log('🔗 Main content view open request:', { url, frameName, disposition });
    
    if (url.startsWith("https://www.notion.so") || url.startsWith("https://notion.so")) {
      if (disposition === 'new-window' || disposition === 'foreground-tab' || disposition === 'background-tab') {
        createNewTab(mainWindow, url);
        return { action: "deny" };
      }
      return { action: "allow" };
    } else {
      shell.openExternal(url);
      return { action: "deny" };
    }
  });
  
  // Listen for title updates
  mainWindow.contentView.webContents.on('page-title-updated', () => {
    console.log('📝 Page title updated, refreshing tab bar');
    updateTabBar(mainWindow);
  });
  
  // Wait for tab bar to load and then update it
  mainWindow.tabBarView.webContents.once('did-finish-load', () => {
    console.log('🎯 Tab bar loaded, initial update');
    setTimeout(() => {
      updateTabBar(mainWindow);
    }, 500);
  });
  
  console.log('🚀 Notion Snap Reborn started with visual tab support!');
});

// Function to inject dark theme CSS for scrollbars and UI
const injectDarkThemeCSS = (webContents) => {
  const darkScrollbarCSS = `
    /* Dark theme scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #2f3437 !important;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #5a6066 !important;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #6a7076 !important;
    }
    
    ::-webkit-scrollbar-corner {
      background: #2f3437 !important;
    }
    
    /* Additional dark theme support for Notion */
    body {
      scrollbar-color: #5a6066 #2f3437 !important;
    }
  `;
  
  webContents.insertCSS(darkScrollbarCSS);
};

// Function to inject light theme CSS for scrollbars
const injectLightThemeCSS = (webContents) => {
  const lightScrollbarCSS = `
    /* Light theme scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1 !important;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #c1c1c1 !important;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1 !important;
    }
    
    ::-webkit-scrollbar-corner {
      background: #f1f1f1 !important;
    }
    
    /* Light theme support for Notion */
    body {
      scrollbar-color: #c1c1c1 #f1f1f1 !important;
    }
  `;
  
  webContents.insertCSS(lightScrollbarCSS);
};

// Function to detect and apply theme
const applyThemeToView = (webContents) => {
  webContents.on('did-finish-load', () => {
    // Inject Linux keyboard shortcuts override first
    setTimeout(() => {
      injectLinuxKeyboardShortcuts(webContents);
    }, 100);
    
    // Detect if Notion is using dark theme
    webContents.executeJavaScript(`
      (function() {
        const isDarkTheme = document.documentElement.classList.contains('dark') || 
                           document.body.classList.contains('dark') ||
                           window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDarkTheme;
      })();
    `).then((isDark) => {
      if (isDark || nativeTheme.shouldUseDarkColors) {
        injectDarkThemeCSS(webContents);
      } else {
        injectLightThemeCSS(webContents);
      }
    }).catch(() => {
      // Fallback to system theme
      if (nativeTheme.shouldUseDarkColors) {
        injectDarkThemeCSS(webContents);
      } else {
        injectLightThemeCSS(webContents);
      }
    });
  });
  
  // Listen for theme changes in the page
  webContents.on('did-navigate', () => {
    setTimeout(() => {
      // Inject keyboard shortcuts override again after navigation
      injectLinuxKeyboardShortcuts(webContents);
      
      webContents.executeJavaScript(`
        (function() {
          const isDarkTheme = document.documentElement.classList.contains('dark') || 
                             document.body.classList.contains('dark') ||
                             window.matchMedia('(prefers-color-scheme: dark)').matches;
          return isDarkTheme;
        })();
      `).then((isDark) => {
        if (isDark || nativeTheme.shouldUseDarkColors) {
          injectDarkThemeCSS(webContents);
        } else {
          injectLightThemeCSS(webContents);
        }
      }).catch(() => {
        if (nativeTheme.shouldUseDarkColors) {
          injectDarkThemeCSS(webContents);
        } else {
          injectLightThemeCSS(webContents);
        }
      });
    }, 1000);
  });
};

// Function to inject Linux keyboard shortcuts override
const injectLinuxKeyboardShortcuts = (webContents) => {
  const keyboardOverrideScript = `
    (function() {
      // Override platform detection for keyboard shortcuts
      Object.defineProperty(navigator, 'platform', {
        get: function() { return 'Linux x86_64'; }
      });
      
      Object.defineProperty(navigator, 'appVersion', {
        get: function() { return '5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; }
      });
      
      // Force Ctrl key behavior instead of Cmd/Meta key
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
          const wrappedListener = function(event) {
            // If Meta key is pressed but we're on Linux, convert to Ctrl
            if (event.metaKey && !event.ctrlKey) {
              const newEvent = new KeyboardEvent(event.type, {
                key: event.key,
                code: event.code,
                ctrlKey: true,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                metaKey: false,
                bubbles: event.bubbles,
                cancelable: event.cancelable
              });
              Object.defineProperty(newEvent, 'target', { value: event.target });
              return listener.call(this, newEvent);
            }
            return listener.call(this, event);
          };
          return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
      
      console.log('🐧 Linux keyboard shortcuts override injected');
    })();
  `;
  
  webContents.executeJavaScript(keyboardOverrideScript).catch(err => {
    console.log('Warning: Could not inject keyboard shortcuts override:', err.message);
  });
};

// Listen for system theme changes
nativeTheme.on('updated', () => {
  // Update all windows
  BrowserWindow.getAllWindows().forEach(window => {
    if (window.tabBarView) {
      window.tabBarView.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
    }
    
    // Update all content views
    if (window.contentViews) {
      window.contentViews.forEach(view => {
        if (nativeTheme.shouldUseDarkColors) {
          injectDarkThemeCSS(view.webContents);
        } else {
          injectLightThemeCSS(view.webContents);
        }
      });
    }
  });
});

// Function to force resize all views (useful for fixing layout issues)
const forceResizeAllViews = (parentWindow) => {
  if (!parentWindow || !parentWindow.contentViews) return;
  
  const bounds = parentWindow.getContentBounds();
  const tabBarHeight = 40;
  
  console.log(`🔧 Force resizing all views to: ${bounds.width}x${bounds.height}`);
  
  // Resize tab bar
  if (parentWindow.tabBarView) {
    parentWindow.tabBarView.setBounds({ x: 0, y: 0, width: bounds.width, height: tabBarHeight });
  }
  
  // Resize all content views
  parentWindow.contentViews.forEach((view, index) => {
    if (view) {
      view.setBounds({ 
        x: 0, 
        y: tabBarHeight, 
        width: bounds.width, 
        height: bounds.height - tabBarHeight 
      });
      console.log(`  📐 Resized view ${index + 1}: ${bounds.width}x${bounds.height - tabBarHeight}`);
    }
  });
  
  console.log(`✅ Force resize completed for ${parentWindow.contentViews.length} views`);
};
