'use client';

import { Logo, Tag } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { OFFICIAL_SITE, RELEASES_URL } from '@/const/url';
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
      <Link href={OFFICIAL_SITE} target={'_blank'}>
        <Logo size={mobile ? 100 : 120} />
      </Link>
      <h1 style={{ fontSize: mobile ? 32 : 36, fontWeight: 900, lineHeight: 1, marginBottom: 0 }}>
        LobeChat
      </h1>
      <Link href={RELEASES_URL} target={'_blank'}>
        <Tag>v{CURRENT_VERSION}</Tag>
      </Link>
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
