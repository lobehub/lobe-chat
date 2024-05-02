import { translation } from '@/server/translation';

import OpenAI from './features/OpenAI';
import STT from './features/STT';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.tts'),
  };
};

const Page = () => {
  return (
    <>
      <STT />
      <OpenAI />
    </>
  );
};

Page.displayName = 'TtsSetting';

export default Page;
