import { BRANDING_EMAIL, BRANDING_URL } from '@lobechat/business-const';

export const SUPPORT_URL = BRANDING_URL.support ?? `mailto:${BRANDING_EMAIL.support}`;
