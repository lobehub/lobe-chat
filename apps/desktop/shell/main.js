const path = require('node:path');
const { app } = require('electron');

const { resolveCore } = require('./core-loader');

const builtinDir = app.isPackaged
  ? path.join(process.resourcesPath, 'core')
  : path.join(__dirname, '..');

const loadAbi = () => {
  try {
    return require('./abi.json');
  } catch (error) {
    if (app.isPackaged) throw error;
    return { publicKey: '', shellAbi: 'dev', shellVersion: app.getVersion() };
  }
};

const abi = loadAbi();

const core = app.isPackaged
  ? resolveCore({
      abi: abi.shellAbi,
      builtinDir,
      publicKey: abi.publicKey,
      userData: app.getPath('userData'),
    })
  : { dir: builtinDir, log: [], manifest: null, markHealthy() {}, source: 'builtin' };

if (app.isPackaged) {
  process.env.NODE_PATH = [path.join(__dirname, '..', 'node_modules'), process.env.NODE_PATH]
    .filter(Boolean)
    .join(path.delimiter);
  // Module.globalPaths.push() is a no-op for resolution; only _initPaths() rebuilds the private list from NODE_PATH
  require('node:module')._initPaths();
}

global.__SHELL__ = {
  abi: abi.shellAbi,
  builtinDir,
  coreDir: core.dir,
  log: core.log,
  manifest: core.manifest,
  markHealthy: core.markHealthy,
  publicKey: abi.publicKey,
  shellVersion: abi.shellVersion,
  source: core.source,
};

require(path.join(core.dir, 'dist', 'main', 'index.js'));
