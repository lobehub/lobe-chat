import os from 'node:os';
import path from 'node:path';

import { COMPUTER_USE_IDENTIFIER } from '@lobechat/device-control/computer-use';
import type { DeviceSystemInfo } from '@lobechat/device-gateway-client';
import { getShellInfo } from '@lobechat/local-file-shell';

import { CLI_CONFIG_DIR_NAME } from '../constants/identity';
import type { ComputerUseDevice } from '../tools/computerUse';

/**
 * The answer to a gateway `system_info_request`. `supportedTools` lists the
 * opt-in tools this device can run; the server refuses those tools on a
 * device that does not list them.
 */
export async function collectSystemInfo(
  computerUse?: ComputerUseDevice,
): Promise<DeviceSystemInfo> {
  const home = os.homedir();
  const platform = process.platform;
  const videosDir = platform === 'linux' ? 'Videos' : 'Movies';

  return {
    arch: os.arch(),
    // Tell the server-side prompt builder which shell runCommand spawns here.
    defaultShell: (await getShellInfo()).displayName,
    desktopPath: path.join(home, 'Desktop'),
    documentsPath: path.join(home, 'Documents'),
    downloadsPath: path.join(home, 'Downloads'),
    homePath: home,
    musicPath: path.join(home, 'Music'),
    picturesPath: path.join(home, 'Pictures'),
    ...(computerUse && { supportedTools: [COMPUTER_USE_IDENTIFIER] }),
    userDataPath: path.join(home, CLI_CONFIG_DIR_NAME),
    videosPath: path.join(home, videosDir),
    workingDirectory: process.cwd(),
  };
}
