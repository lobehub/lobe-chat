import { Flexbox } from 'react-layout-kit';

import Follow from '@//features/Follow';
import AboutList from '@/app/(main)/settings//about/features/AboutList';
import Analytics from '@/app/(main)/settings/about/features/Analytics';
import { getServerConfig } from '@/config/server';
import { translation } from '@/server/translation';

const enabledTelemetryChat = getServerConfig().ENABLE_LANGFUSE;

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.about'),
  };
};

const Page = () => {
  return (
    <>
      <Flexbox gap={24} style={{ marginBlock: 48 }} width={'100%'}>
        <AboutList />
        {enabledTelemetryChat && <Analytics />}
      </Flexbox>
      <Follow />
    </>
  );
};

Page.displayName = 'AboutSetting';

export default Page;
