'use client';

import { Logo, Tag } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CURRENT_VERSION } from '@/const/version';
import Follow from '@/features/Follow';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';

import AboutList from './features/AboutList';
import Analytics from './features/Analytics';

const COPYRIGHT = `© 2023-${new Date().getFullYear()} LobeHub, LLC`;

const Page = memo(({ mobile }: { mobile?: boolean }) => {
  const enabledTelemetryChat = useServerConfigStore(serverConfigSelectors.enabledTelemetryChat);

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
});

Page.displayName = 'AboutSetting';

export default Page;
