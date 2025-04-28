import { platform } from 'node:os';

import { MacOSSearchServiceImpl } from './impl/macOS';

export const createFileSearchModule = () => {
  const currentPlatform = platform();

  switch (currentPlatform) {
    case 'darwin': {
      return new MacOSSearchServiceImpl();
    }
    // case 'win32':
    //   return new WindowsSearchServiceImpl();
    // case 'linux':
    //   return new LinuxSearchServiceImpl();
    default: {
      return new MacOSSearchServiceImpl();
      // throw new Error(`Unsupported platform: ${currentPlatform}`);
    }
  }
};

export { FileSearchImpl } from './type';
