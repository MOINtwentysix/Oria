const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'assets'),
];

const nodeModules = path.resolve(__dirname, 'node_modules');
const srcDir = path.resolve(__dirname, 'src');
const rootDir = __dirname;
const assetsDir = path.resolve(__dirname, 'assets');

config.resolver.extraNodeModules = (request) => {
  if (request === '@') {
    return srcDir;
  }
  if (request.startsWith('@/assets/')) {
    return path.join(assetsDir, request.slice(9));
  }
  if (request.startsWith('@/')) {
    return path.join(srcDir, request.slice(2));
  }
  if (request.startsWith('@assets/')) {
    return path.join(assetsDir, request.slice(8));
  }
  if (request.startsWith('assets/')) {
    return path.join(assetsDir, request.slice(7));
  }
  return path.join(nodeModules, request);
};

module.exports = config;
