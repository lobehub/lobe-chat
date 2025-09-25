import { CustomSessionGroup, LobeSessionGroups } from '@lobechat/types';

export interface SessionGroupState {
  activeGroupId?: string;
  customSessionGroups: CustomSessionGroup[];
  sessionGroups: LobeSessionGroups;
}

export const initSessionGroupState: SessionGroupState = {
  customSessionGroups: [],
  sessionGroups: [],
};
