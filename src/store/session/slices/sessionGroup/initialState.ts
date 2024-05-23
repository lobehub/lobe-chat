import { CustomSessionGroup, LobeSessionGroups } from '@/types/session';

export interface SessionGroupState {
  activeGroupId?: string;
  customSessionGroups: CustomSessionGroup[];
  sessionGroups: LobeSessionGroups;
}

export const initSessionGroupState: SessionGroupState = {
  customSessionGroups: [],
  sessionGroups: [],
};
