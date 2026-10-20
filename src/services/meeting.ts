import type {
  MeetingLanguage,
  MeetingPlatform,
  MeetingRealtimeProvider,
  MeetingRefineProvider,
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

export interface ListMeetingsParams {
  limit?: number;
  offset?: number;
  status?: MeetingStatus;
}

class MeetingService {
  list = async (params?: ListMeetingsParams) =>
    (await lambdaClient.meeting.list.query(params)).data;

  detail = async (id: string) => (await lambdaClient.meeting.detail.query({ id })).data;

  create = async (params: CreateMeetingParams) =>
    (await lambdaClient.meeting.create.mutate(params)).data;

  pause = (id: string) => lambdaClient.meeting.pause.mutate({ id });

  resume = (id: string) => lambdaClient.meeting.resume.mutate({ id });

  finish = (id: string, durationMs: number) =>
    lambdaClient.meeting.finish.mutate({ durationMs, id });

  attachAudio = (id: string, audioFileId: string) =>
    lambdaClient.meeting.attachAudio.mutate({ audioFileId, id });

  rename = (id: string, title: string) => lambdaClient.meeting.rename.mutate({ id, title });

  delete = (id: string) => lambdaClient.meeting.delete.mutate({ id });

  /** Store live-draft segments; a repeated `seq` replaces the stored row. */
  appendRealtimeSegments = (meetingId: string, segments: MeetingSegmentParams[]) =>
    lambdaClient.meeting.appendSegments.mutate({
      meetingId,
      segments: segments.map((segment) => ({ ...segment, source: 'realtime' as const })),
    });
}

export const meetingService = new MeetingService();

export type MeetingListItem = Awaited<ReturnType<MeetingService['list']>>[number];
export type MeetingDetail = NonNullable<Awaited<ReturnType<MeetingService['detail']>>>;
