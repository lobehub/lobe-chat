import { CustomSessionGroup, LobeSessionGroups } from '@/types/session';

export interface SessionGroupState {
  customSessionGroups: CustomSessionGroup[];
  sessionGroups: LobeSessionGroups;
}

export const initSessionGroupState: SessionGroupState = {
  customSessionGroups: [],
  sessionGroups: [],
};
