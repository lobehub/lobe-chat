import { GlobalStore } from '@/store/global';

const sessionGroupKeys = (s: GlobalStore): string[] => s.preference.expandSessionGroupKeys || [];

const useCmdEnterToSend = (s: GlobalStore): boolean => s.preference.useCmdEnterToSend || false;

const enabledOAuthSSO = (s: GlobalStore): boolean => s.serverConfig.enabledOAuthSSO || false;

export const preferenceSelectors = {
  enabledOAuthSSO,
  sessionGroupKeys,
  useCmdEnterToSend,
};
