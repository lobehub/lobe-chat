import { ThreadItem, ThreadType } from '@/types/topic';

export interface ChatThreadState {
  activeThreadId?: string;
  /**
   * is creating thread with service call
   */
  isCreatingThread?: boolean;
  isCreatingThreadMessage?: boolean;
  newThreadMode: ThreadType;
  /**
   * if true it mean to start to fork a new thread
   */
  startToForkThread?: boolean;

  threadInputMessage: string;
  threadLoadingIds: string[];
  threadMaps: Record<string, ThreadItem[]>;
  threadRenamingId?: string;
  /**
   * when open thread creator, set the message id to it
   */
  threadStartMessageId?: string;
  threadsInit?: boolean;
}

export const initialThreadState: ChatThreadState = {
  isCreatingThread: false,
  newThreadMode: ThreadType.Continuation,
  threadInputMessage: '',
  threadLoadingIds: [],
  threadMaps: {},
  threadsInit: false,
};
