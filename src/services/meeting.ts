import type {
  MeetingLanguage,
  MeetingPlatform,
  MeetingRealtimeProvider,
  MeetingRefineProvider,
  MeetingSegmentSource,
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

class MeetingService {
  create = async (params: CreateMeetingParams) =>
    (await lambdaClient.meeting.create.mutate(params)).data;

  /** Meeting with one transcript: refined once available, else the live draft (`source` forces one). */
  detail = async (id: string, source?: MeetingSegmentSource) =>
    (await lambdaClient.meeting.detail.query({ id, source })).data;

  pause = (id: string) => lambdaClient.meeting.pause.mutate({ id });

  resume = (id: string) => lambdaClient.meeting.resume.mutate({ id });

  finish = (id: string, durationMs: number) =>
    lambdaClient.meeting.finish.mutate({ durationMs, id });

  attachAudio = (id: string, audioFileId: string) =>
    lambdaClient.meeting.attachAudio.mutate({ audioFileId, id });

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
}

export const meetingService = new MeetingService();
