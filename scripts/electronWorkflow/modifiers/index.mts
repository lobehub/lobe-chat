import { modifyAppCode } from './appCode.mjs';
import { cleanUpCode } from './cleanUp.mjs';
import { modifyNextConfig } from './nextConfig.mjs';
import { modifyRoutes } from './routes.mjs';

export const modifySourceForElectron = async (TEMP_DIR: string) => {
  await modifyNextConfig(TEMP_DIR);
  await modifyAppCode(TEMP_DIR);
  await modifyRoutes(TEMP_DIR);
  await cleanUpCode(TEMP_DIR);
};
