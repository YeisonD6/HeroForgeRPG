const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');

// Enable Windows native recursive directory watching (ReadDirectoryChangesW)
// so Metro Bundler starts in ~2 seconds instead of hanging while crawling node_modules.
if (os.platform() === 'win32') {
  try {
    const NativeWatcher = require('@expo/metro-file-map/build/watchers/NativeWatcher').default;
    if (NativeWatcher) {
      NativeWatcher.isSupported = () => true;
    }
  } catch {
    // Ignore if internal module path changes in future versions
  }
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
