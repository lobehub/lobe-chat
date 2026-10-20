'use client';

import { useParams } from 'react-router';

import { MeetingTranscript } from '@/features/MeetingTranscription';

/** One meeting's transcript. */
const MeetingDetailRoute = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  if (!meetingId) return null;

  return <MeetingTranscript key={meetingId} meetingId={meetingId} />;
};

export default MeetingDetailRoute;
