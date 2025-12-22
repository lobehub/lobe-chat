import { ReferralStatusString } from '@lobechat/types';

import { Plans } from '@/types/subscription';

export interface CommonState {
  isFreePlan?: boolean;
  /** @deprecated Use onboarding field instead */
  isOnboard: boolean;
  isShowPWAGuide: boolean;
  isUserCanEnableTrace: boolean;
  isUserHasConversation: boolean;
  isUserStateInit: boolean;
  referralStatus?: ReferralStatusString;
  subscriptionPlan?: Plans;
}

export const initialCommonState: CommonState = {
  isFreePlan: true,
  isOnboard: false,
  isShowPWAGuide: false,
  isUserCanEnableTrace: false,
  isUserHasConversation: false,
  isUserStateInit: false,
  referralStatus: undefined,
};
