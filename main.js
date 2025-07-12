console.log("--- LOADING LATEST CODE - v3 ---"); // <-- Agrega esto en la línea 1

const { app, BrowserWindow, shell, session, Menu, ipcMain, BrowserView, nativeTheme } = require("electron");
const path = require('path');

// Global variable to track if IPC handlers are already registered
let ipcHandlersRegistered = false;

// Global debounce mechanism to prevent rapid actions
let globalActionDebounce = {
  newTab: false,
  lastNewTabTime: 0
};

// Global action counter for debugging
let actionCounter = {
  tabCreation: 0,
  ipcCalls: 0
};

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
  actionCounter.tabCreation++;
  console.log(`🔥 [${actionCounter.tabCreation}] createNewTab called for: ${url}`);
  
  // Check global debounce timer
  const now = Date.now();
  if (globalActionDebounce.newTab && now - globalActionDebounce.lastNewTabTime < 500) {
    console.log(`⏱️ [${actionCounter.tabCreation}] New tab action debounced - last action was ${now - globalActionDebounce.lastNewTabTime}ms ago`);
    return;
  }
  globalActionDebounce.newTab = true;
  globalActionDebounce.lastNewTabTime = now;
  
  console.log(`✅ [${actionCounter.tabCreation}] Proceeding with tab creation`);
  
  // Reset debounce after 1 second
  setTimeout(() => {
    globalActionDebounce.newTab = false;
    console.log(`🔓 [${actionCounter.tabCreation}] Debounce reset`);
  }, 1000);
  
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
  
  // Handle window open events for this tab (prevent duplicate handlers)
  if (!newContentView.webContents.windowOpenHandlerSet) {
    newContentView.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
      console.log('Tab window open request:', { url, frameName, disposition });
      
      if (url.startsWith("https://www.notion.so") || url.startsWith("https://notion.so")) {
        if (disposition === 'new-window' || disposition === 'foreground-tab' || disposition === 'background-tab') {
          // Prevent multiple rapid tab creation
          if (!newContentView.creatingNewTab) {
            newContentView.creatingNewTab = true;
            setTimeout(() => { newContentView.creatingNewTab = false; }, 500);
            createNewTab(parentWindow, url);
          }
          return { action: "deny" };
        }
        return { action: "allow" };
      } else {
        shell.openExternal(url);
        return { action: "deny" };
      }
    });
    newContentView.webContents.windowOpenHandlerSet = true;
  }

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
  
  // Try multiple methods to ensure the message gets through
  try {
    parentWindow.tabBarView.webContents.send('update-tabs', tabs, parentWindow.activeTabIndex);
    console.log('✅ Tab bar update sent successfully');
  } catch (error) {
    console.log('❌ Error sending tab bar update:', error.message);
  }
  
  updateWindowTitle(parentWindow);
};

// Function to register IPC handlers (only once)
const registerIpcHandlers = () => {
  if (ipcHandlersRegistered) {
    console.log('⚠️ IPC handlers already registered, skipping');
    return;
  }
  
  console.log('📡 Registering IPC handlers');
  
  // IPC handlers for tab management
  ipcMain.on('get-tabs', (event) => {
    actionCounter.ipcCalls++;
    console.log(`📨 [${actionCounter.ipcCalls}] Received get-tabs request`);
    const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
    if (parentWindow) {
      console.log(`🔍 Found parent window with ${parentWindow.contentViews.length} content views`);
      const tabs = getTabsInfo(parentWindow);
      console.log('📤 Sending tabs to tab bar:', tabs);
      // Use both reply and direct send to ensure delivery
      event.reply('update-tabs', tabs, parentWindow.activeTabIndex);
      event.sender.send('update-tabs', tabs, parentWindow.activeTabIndex);
    } else {
      console.log('❌ Could not find parent window for get-tabs request');
      // Send empty tabs if no window found
      event.reply('update-tabs', [], 0);
    }
  });

  ipcMain.on('new-tab', (event) => {
    actionCounter.ipcCalls++;
    console.log(`🔥 [${actionCounter.ipcCalls}] Received new-tab request`);
    const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
    if (parentWindow) {
      createNewTab(parentWindow);
    }
  });

  ipcMain.on('close-tab', (event, tabIndex) => {
    actionCounter.ipcCalls++;
    console.log(`🗑️ [${actionCounter.ipcCalls}] Received close-tab request for index: ${tabIndex}`);
    const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
    if (parentWindow) {
      closeTab(parentWindow, tabIndex);
    }
  });

  ipcMain.on('switch-tab', (event, tabIndex) => {
    actionCounter.ipcCalls++;
    console.log(`🔄 [${actionCounter.ipcCalls}] Received switch-tab request for index: ${tabIndex}`);
    const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
    if (parentWindow) {
      switchToTab(parentWindow, tabIndex);
    }
  });

  ipcMain.on('force-resize', (event) => {
    actionCounter.ipcCalls++;
    console.log(`📐 [${actionCounter.ipcCalls}] Received force-resize request`);
    const parentWindow = BrowserWindow.getAllWindows().find(win => win.tabBarView?.webContents === event.sender);
    if (parentWindow) {
      forceResizeAllViews(parentWindow);
    }
  });
  
  ipcHandlersRegistered = true;
};

// IPC handlers are now registered via registerIpcHandlers() function above

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Register IPC handlers once at startup
  registerIpcHandlers();

  // Set application menu
  const applicationMenu = createApplicationMenu();
  Menu.setApplicationMenu(applicationMenu);

  const mainWindow = createWindow();
  
  // Handle new window requests for the main content view (prevent duplicate handlers)
  if (!mainWindow.contentView.webContents.windowOpenHandlerSet) {
    mainWindow.contentView.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
      console.log('🔗 Main content view open request:', { url, frameName, disposition });
      
      if (url.startsWith("https://www.notion.so") || url.startsWith("https://notion.so")) {
        if (disposition === 'new-window' || disposition === 'foreground-tab' || disposition === 'background-tab') {
          // Prevent multiple rapid tab creation
          if (!mainWindow.contentView.creatingNewTab) {
            mainWindow.contentView.creatingNewTab = true;
            setTimeout(() => { mainWindow.contentView.creatingNewTab = false; }, 500);
            createNewTab(mainWindow, url);
          }
          return { action: "deny" };
        }
        return { action: "allow" };
      } else {
        shell.openExternal(url);
        return { action: "deny" };
      }
    });
    mainWindow.contentView.webContents.windowOpenHandlerSet = true;
  }
  
  // Listen for title updates
  mainWindow.contentView.webContents.on('page-title-updated', () => {
    console.log('📝 Page title updated, refreshing tab bar');
    updateTabBar(mainWindow);
  });
  
  // Wait for tab bar to load and then update it
  mainWindow.tabBarView.webContents.once('did-finish-load', () => {
    console.log('🎯 Tab bar loaded, initial update');
    
    // Add debugging for tab bar
    mainWindow.tabBarView.webContents.on('console-message', (event, level, message) => {
      console.log(`[TAB-BAR] ${message}`);
    });
    
    // Multiple attempts to ensure tab bar gets updated
    setTimeout(() => {
      console.log('🔄 First tab bar update attempt');
      updateTabBar(mainWindow);
    }, 100);
    
    setTimeout(() => {
      console.log('🔄 Second tab bar update attempt');
      updateTabBar(mainWindow);
    }, 500);
    
    setTimeout(() => {
      console.log('🔄 Third tab bar update attempt');
      updateTabBar(mainWindow);
    }, 1000);
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
  // Inject Linux keyboard shortcuts only once when the page finishes loading for the first time
  webContents.once('did-finish-load', () => {
    console.log('🐧 Injecting Linux keyboard shortcuts (one-time only)');
    setTimeout(() => {
      injectLinuxKeyboardShortcuts(webContents);
    }, 100);
  });
  
  // Apply theme styling on every page load
  webContents.on('did-finish-load', () => {
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
  
  // Listen for theme changes in the page (only apply theme, no keyboard shortcuts)
  webContents.on('did-navigate', () => {
    setTimeout(() => {
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
  // Prevent multiple injections with a robust check
  if (webContents.keyboardShortcutsInjected) {
    console.log('⚠️ Keyboard shortcuts already injected for this webContents, skipping');
    return;
  }
  
  const keyboardOverrideScript = `
    (function() {
      // Check if already injected
      if (window.notionKeyboardShortcutsInjected) {
        console.log('⚠️ Keyboard shortcuts already injected, skipping');
        return;
      }
      window.notionKeyboardShortcutsInjected = true;
      
      console.log('🐧 Applying less invasive Linux keyboard shortcuts (v2.0)');

      document.addEventListener('keydown', (event) => {
        // Intercept Meta key presses (Super/Windows key) and remap them to Ctrl.
        // This is for shortcuts like Meta+A (Select All), Meta+V (Paste), etc.
        const isMac = /Mac|iMac|iPhone|iPad|iPod/i.test(navigator.platform);
        if (!isMac && event.metaKey && !event.ctrlKey) {
          
          // Prevent the original event from being processed
          event.preventDefault();
          event.stopPropagation();

          // Dispatch a new, synthetic event with the Ctrl key pressed instead.
          const newEvent = new KeyboardEvent('keydown', {
            key: event.key,
            code: event.code,
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
            altKey: event.altKey,
            shiftKey: event.shiftKey,
            ctrlKey: true, // The important part: simulate Ctrl
            metaKey: false // The important part: disable Meta
          });
          
          event.target.dispatchEvent(newEvent);
        }
      }, true); // Use capture phase to catch the event early

      console.log('✅ Linux keyboard remapping is active.');
    })();
  `;
  
  webContents.executeJavaScript(keyboardOverrideScript).then(() => {
    webContents.keyboardShortcutsInjected = true;
    console.log('✅ Successfully injected new keyboard handler.');
  }).catch(err => {
    console.log('❌ Error injecting new keyboard handler:', err.message);
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
