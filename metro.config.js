const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, 'assets')];

const srcDir = path.resolve(__dirname, 'src');
const assetsDir = path.resolve(__dirname, 'assets');

config.resolver.extraNodeModules = (request) => {
  if (request === '@') {
    return srcDir;
  }
  if (request.startsWith('@/')) {
    const rest = request.slice(2);
    // Check if it's an asset file
    if (rest.startsWith('assets/')) {
      return path.join(assetsDir, rest.slice(7));
    }
    return path.join(srcDir, rest);
  }
  if (request.startsWith('@assets/')) {
    return path.join(assetsDir, request.slice(8));
  }
  if (request.startsWith('assets/')) {
    return path.join(assetsDir, request.slice(7));
  }
  return null;
};

module.exports = config;
