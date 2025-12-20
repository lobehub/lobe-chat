import { Plans } from '@/types/subscription';

export interface CommonState {
  /** @deprecated Use onboarding field instead */
  isOnboard: boolean;
  isShowPWAGuide: boolean;
  isUserCanEnableTrace: boolean;
  isUserHasConversation: boolean;
  isUserStateInit: boolean;
  subscriptionPlan?: Plans;
}

export const initialCommonState: CommonState = {
  isOnboard: false,
  isShowPWAGuide: false,
  isUserCanEnableTrace: false,
  isUserHasConversation: false,
  isUserStateInit: false,
};
