import pkg from '@/../package.json';

import { BRANDING_NAME, ORG_NAME } from './branding';

export const CURRENT_VERSION = pkg.version;

export const isServerMode = true;
export const isUsePgliteDB = false;

export const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';

export const isDeprecatedEdition = false;

// @ts-ignore
export const isCustomBranding = BRANDING_NAME !== 'LobeHub';
// @ts-ignore
export const isCustomORG = ORG_NAME !== 'LobeHub';
