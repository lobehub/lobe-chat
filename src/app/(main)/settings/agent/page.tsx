import AgentChat from '@/features/AgentSetting/AgentChat';
import AgentMeta from '@/features/AgentSetting/AgentMeta';
import AgentModal from '@/features/AgentSetting/AgentModal';
import AgentPlugin from '@/features/AgentSetting/AgentPlugin';
import AgentPrompt from '@/features/AgentSetting/AgentPrompt';
import AgentTTS from '@/features/AgentSetting/AgentTTS';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.agent'),
  };
};

const Page = () => {
  return (
    <>
      <AgentPrompt />
      <AgentMeta />
      <AgentChat />
      <AgentModal />
      <AgentTTS />
      <AgentPlugin />
    </>
  );
};

Page.displayName = 'AgentSetting';

export default Page;
