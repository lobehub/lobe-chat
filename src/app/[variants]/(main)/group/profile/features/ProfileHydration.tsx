import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { memo } from 'react';

import { useRegisterFilesHotkeys, useSaveDocumentHotkey } from '@/hooks/useHotkeys';
import { useAgentStore } from '@/store/agent';

import { useProfileStore } from './store';

const ProfileHydration = memo(() => {
  // Initialize agent builder builtin agent
  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
  const flushSave = useProfileStore((s) => s.flushSave);
  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.agentBuilder);
  useRegisterFilesHotkeys();
  useSaveDocumentHotkey(flushSave);

  return null;
});

export default ProfileHydration;
