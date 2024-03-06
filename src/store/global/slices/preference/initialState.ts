import { SessionDefaultGroup, SessionGroupId } from '@/types/session';

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface GlobalPreference {
  // which sessionGroup should expand
  expandSessionGroupKeys: SessionGroupId[];
  guide?: Guide;
  inputHeight: number;
  mobileShowTopic?: boolean;
  sessionsWidth: number;

  showChatSideBar?: boolean;
  showSessionPanel?: boolean;
  showSystemRole?: boolean;
  telemetry: boolean | null;
  /**
   * whether to use cmd + enter to send message
   */
  useCmdEnterToSend?: boolean;
}

export interface GlobalPreferenceState {
  /**
   *  用户偏好的 UI 状态
   *  @localStorage
   */
  preference: GlobalPreference;
}

export const initialPreferenceState: GlobalPreferenceState = {
  preference: {
    expandSessionGroupKeys: [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default],
    guide: {},
    inputHeight: 200,
    mobileShowTopic: false,
    sessionsWidth: 320,
    showChatSideBar: true,
    showSessionPanel: true,
    showSystemRole: false,
    telemetry: null,
    useCmdEnterToSend: false,
  },
};
