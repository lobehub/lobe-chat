// import { isDesktop } from '@/const/version';
import { getDBInstance } from '@/database/core/web-server';

// import { getPgliteInstance } from './electron';

export const serverDB = getDBInstance();
