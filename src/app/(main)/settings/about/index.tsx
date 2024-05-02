import { Logo, Tag } from '@lobehub/ui';
import { Flexbox } from 'react-layout-kit';

import Follow from '@//features/Follow';
import AboutList from '@/app/(main)/settings//about/features/AboutList';
import Analytics from '@/app/(main)/settings/about/features/Analytics';
import { getServerConfig } from '@/config/server';
import { CURRENT_VERSION } from '@/const/version';

const enabledTelemetryChat = getServerConfig().ENABLE_LANGFUSE;

const COPYRIGHT = `© 2023-${new Date().getFullYear()} LobeHub, LLC`;

const Page = ({ mobile }: { mobile?: boolean }) => {
  return (
    <Flexbox align={'center'} gap={12} paddingBlock={36} width={'100%'}>
      <Logo size={mobile ? 100 : 120} />
      <h1 style={{ fontSize: mobile ? 32 : 36, fontWeight: 900, lineHeight: 1, marginBottom: 0 }}>
        LobeChat
      </h1>
      <Tag>v{CURRENT_VERSION}</Tag>
      <Flexbox gap={24} style={{ marginBlock: 48 }} width={'100%'}>
        <AboutList />
        {enabledTelemetryChat && <Analytics />}
      </Flexbox>
      <Follow />
      <div>Empowering your AI dreams by LobeHub</div>
      <div style={{ fontWeight: 400, opacity: 0.33 }}>{COPYRIGHT}</div>
    </Flexbox>
  );
};

Page.displayName = 'AboutSetting';

export default Page;
