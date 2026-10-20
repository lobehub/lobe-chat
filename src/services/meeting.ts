import type {
  MeetingActionItem,
  MeetingAssigneeType,
  MeetingLanguage,
  MeetingPlatform,
  MeetingRealtimeProvider,
  MeetingRefineProvider,
  MeetingSegmentSource,
  MeetingStatus,
} from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';

export interface CreateMeetingParams {
  language?: MeetingLanguage;
  platform: MeetingPlatform;
  realtimeProvider: MeetingRealtimeProvider;
  refineProvider: MeetingRefineProvider;
  title: string;
}

export interface MeetingSegmentParams {
  endMs: number;
  seq: number;
  startMs: number;
  text: string;
}

export interface CreateMeetingTaskItem {
  assignee?: { id: string; type: MeetingAssigneeType } | null;
  dueDate?: string | null;
  id: string;
  text: string;
}

export interface ListMeetingsParams {
  limit?: number;
  offset?: number;
  status?: MeetingStatus;
}

class MeetingService {
  list = async (params?: ListMeetingsParams) =>
    (await lambdaClient.meeting.list.query(params)).data;

  /** Meeting with one transcript: refined once available, else the live draft (`source` forces one). */
  detail = async (id: string, source?: MeetingSegmentSource) =>
    (await lambdaClient.meeting.detail.query({ id, source })).data;

  create = async (params: CreateMeetingParams) =>
    (await lambdaClient.meeting.create.mutate(params)).data;

  pause = (id: string) => lambdaClient.meeting.pause.mutate({ id });

  resume = (id: string) => lambdaClient.meeting.resume.mutate({ id });

  finish = (id: string, durationMs: number) =>
    lambdaClient.meeting.finish.mutate({ durationMs, id });

  attachAudio = (id: string, audioFileId: string) =>
    lambdaClient.meeting.attachAudio.mutate({ audioFileId, id });

  rename = (id: string, title: string) => lambdaClient.meeting.rename.mutate({ id, title });

  /** Name a diarized speaker; to-dos the minutes gave that speaker follow the name. */
  renameSpeaker = (meetingId: string, speakerId: string, displayName: string | null) =>
    lambdaClient.meeting.renameSpeaker.mutate({ displayName, meetingId, speakerId });

  delete = (id: string) => lambdaClient.meeting.delete.mutate({ id });

  /** Store live-draft segments; a repeated `seq` replaces the stored row. */
  appendRealtimeSegments = (meetingId: string, segments: MeetingSegmentParams[]) =>
    lambdaClient.meeting.appendSegments.mutate({
      meetingId,
      segments: segments.map((segment) => ({ ...segment, source: 'realtime' as const })),
    });

  /** Transcribe and store one live window (deployments without a realtime gateway). */
  transcribeLive = async (params: {
    audioBase64: string;
    endMs: number;
    meetingId: string;
    seq: number;
    startMs: number;
  }) => (await lambdaClient.meeting.transcribeLive.mutate(params)).data;

  refine = async (id: string) => (await lambdaClient.meeting.refine.mutate({ id })).data;

  /** (Re)generate the minutes from the final transcript. */
  generateMinutes = async (id: string) =>
    (await lambdaClient.meeting.generateMinutes.mutate({ id })).data;

  /** Members and agents an action item can be assigned to. */
  assigneeCandidates = async () => (await lambdaClient.meeting.assigneeCandidates.query()).data;

  /** Turn confirmed action items into tasks; created tasks are linked back into the minutes. */
  createTasks = async (meetingId: string, items: CreateMeetingTaskItem[]) =>
    (await lambdaClient.meeting.createTasks.mutate({ items, meetingId })).data;

  /** Replace the action items, e.g. after dismissing or restoring one. */
  saveActionItems = (meetingId: string, actionItems: MeetingActionItem[]) =>
    lambdaClient.meeting.saveMinutes.mutate({ actionItems, meetingId });
}

export const meetingService = new MeetingService();

export type MeetingListItem = Awaited<ReturnType<MeetingService['list']>>[number];
export type MeetingDetail = NonNullable<Awaited<ReturnType<MeetingService['detail']>>>;
export type MeetingAssigneeCandidate = Awaited<
  ReturnType<MeetingService['assigneeCandidates']>
>[number];
