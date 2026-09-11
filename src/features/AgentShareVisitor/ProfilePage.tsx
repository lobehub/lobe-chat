'use client';

import { memo } from 'react';

import Profile from './Profile';
import ShareGate from './ShareGate';

/**
 * Route entry for `/a/:slugOrId` — the share's landing surface.
 *
 * Until this split, the link landed straight in an empty conversation: a
 * stranger was asked to type before anything told them what the agent was for,
 * what it could reach, or whose budget the reply would spend. The composer now
 * lives at `/a/:slugOrId/chat` and this page answers those questions first.
 */
const AgentShareProfilePage = memo(() => (
  <ShareGate>{(data, slugOrId) => <Profile data={data} slugOrId={slugOrId} />}</ShareGate>
));

AgentShareProfilePage.displayName = 'AgentShareProfilePage';

export default AgentShareProfilePage;
