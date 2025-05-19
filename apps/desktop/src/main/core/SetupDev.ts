import { app } from 'electron';
import { macOS } from 'electron-is';
import { join } from 'node:path';
import { buildDir } from '@/const/dir';
import { isDev } from '@/const/env';
import { createLogger } from '@/utils/logger';
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS, ExtensionReference } from 'electron-devtools-installer'

// https://swr.vercel.app/docs/advanced/devtools
const SWR_DEVTOOLS: ExtensionReference = {
  id: "liidbicegefhheghhjbomajjaehnjned"
}

const logger = createLogger('core:setupDev');

export default class SetupDev {
  static async init() {
    if (!isDev) return;

    logger.debug('Initializing dev tools');

    const setup = new SetupDev();
    setup.setDevBranding();
    setup.installDevTools();

    logger.debug('Dev tools initialized');
  }

  private setDevBranding = () => {
    logger.debug('Setting up dev branding');
    app.setName('lobehub-desktop-dev');
    if (macOS()) {
      app.dock!.setIcon(join(buildDir, 'icon-dev.png'));
    }
  };

  private installDevTools = async () => {
    logger.debug('Installing dev tools');
    app.on('ready', () => {
      installExtension([
        REDUX_DEVTOOLS,
        REACT_DEVELOPER_TOOLS,
        SWR_DEVTOOLS,
      ])
        .then((extensions) => {
          logger.info(`Added Extensions: ${extensions.map((ext) => ext.name).join(', ')}`);
        })
        .catch((err) => {
          logger.error('Failed to install devtools extensions:', err);
        });
    });
  };
}
