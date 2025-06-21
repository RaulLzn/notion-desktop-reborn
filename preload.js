// Preload script to enable Notion keyboard shortcuts
console.log('🔧 Preload script loaded - Enabling Notion shortcuts');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM ready - Setting up keyboard shortcut enabler');
  
  // Override addEventListener to prevent blocking of keyboard shortcuts
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'keydown' && typeof listener === 'function') {
      const wrappedListener = function(event) {
        // Allow all Notion shortcuts to pass through
        const isNotionShortcut = (
          (event.ctrlKey || event.metaKey) && 
          ['z', 'y', 'k', 'f', 'b', 'i', 'u', '/', 'c', 'v', 'x', 'a', 'l', 's', 'enter'].includes(event.key.toLowerCase())
        );
        
        if (isNotionShortcut) {
          console.log('⚡ Ensuring Notion shortcut works:', event.key, 'Ctrl:', event.ctrlKey, 'Meta:', event.metaKey);
          // Don't call preventDefault for Notion shortcuts
          const originalPreventDefault = event.preventDefault;
          event.preventDefault = function() {
            console.log('🚫 Blocked preventDefault for Notion shortcut');
            // Do nothing - allow the shortcut to work
          };
          
          const result = listener.call(this, event);
          
          // Restore original preventDefault
          event.preventDefault = originalPreventDefault;
          return result;
        }
        
        return listener.call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
});

// Also listen for keydown events globally
window.addEventListener('keydown', function(e) {
  console.log('🎹 Global key captured:', e.key, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey, 'Prevented:', e.defaultPrevented);
  
  // Force some common Notion shortcuts to work
  if ((e.ctrlKey || e.metaKey) && ['k', 'z', 'f'].includes(e.key.toLowerCase())) {
    console.log('🔄 Forcing Notion shortcut to execute');
    // Dispatch a new event directly to the document
    const newEvent = new KeyboardEvent('keydown', {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      bubbles: true,
      cancelable: true
    });
    
    // Stop the original event from bubbling further up
    e.stopImmediatePropagation();
    
    // Dispatch the new event
    setTimeout(() => {
      document.dispatchEvent(newEvent);
    }, 1);
  }
}, { capture: true, passive: false });

console.log('✅ Notion keyboard shortcut enabler ready');
