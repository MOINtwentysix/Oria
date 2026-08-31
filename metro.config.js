const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];

const nodeModules = path.resolve(__dirname, 'node_modules');
const srcDir = path.resolve(__dirname, 'src');
const rootDir = __dirname;

config.resolver.extraNodeModules = (request) => {
  if (request === '@') {
    return srcDir;
  }
  if (request.startsWith('@assets/')) {
    return path.join(rootDir, request.slice(1));
  }
  if (request.startsWith('@/')) {
    return path.join(srcDir, request.slice(2));
  }
  return path.join(nodeModules, request);
};

module.exports = config;
