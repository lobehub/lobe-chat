import type { UserStore } from '@/store/user';

import { currentSettings } from './settings';

const humanInterventionConfig = (s: UserStore) => currentSettings(s).tool?.humanIntervention || {};

const interventionApprovalMode = (s: UserStore) =>
  currentSettings(s).tool?.humanIntervention?.approvalMode || 'manual';

const interventionAllowList = (s: UserStore) =>
  currentSettings(s).tool?.humanIntervention?.allowList || [];

export const toolInterventionSelectors = {
  allowList: interventionAllowList,
  approvalMode: interventionApprovalMode,
  config: humanInterventionConfig,
};
