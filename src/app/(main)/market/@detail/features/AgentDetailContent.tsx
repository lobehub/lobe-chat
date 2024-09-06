'use client';

import { Markdown, TabsNav } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Banner from '@/app/(main)/market/@detail/features/Banner';
import { useMarketStore } from '@/store/market';

import Comment from './Comment';
import Header from './Header';
import Loading from './Loading';
import TokenTag from './TokenTag';

enum InfoTabs {
  comment = 'comment',
  prompt = 'prompt',
}

const AgentDetailContent = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [useFetchAgent, currentIdentifier] = useMarketStore((s) => [
    s.useFetchAgent,
    s.currentIdentifier,
  ]);
  const { t } = useTranslation('market');
  const [tab, setTab] = useState<string>(InfoTabs.prompt);
  const { data, isLoading } = useFetchAgent(currentIdentifier);

  if (isLoading || !data?.meta) return <Loading />;

  const { config, meta, identifier } = data;
  const { systemRole } = config;

  return (
    <>
      <Banner avatar={meta.avatar} backgroundColor={meta.backgroundColor} mobile={mobile} />
      <Header />
      <Flexbox align={'center'}>
        <TabsNav
          activeKey={tab}
          items={[
            {
              key: InfoTabs.prompt,
              label: (
                <Flexbox align={'center'} gap={8} horizontal>
                  {t('sidebar.prompt')} <TokenTag systemRole={systemRole} />
                </Flexbox>
              ),
            },
            {
              key: InfoTabs.comment,
              label: t('sidebar.comment'),
            },
          ]}
          onChange={setTab}
          style={{ paddingTop: 8 }}
          variant={'compact'}
        />
      </Flexbox>
      <Flexbox style={{ padding: 16 }}>
        {tab === InfoTabs.prompt && (
          <Markdown fullFeaturedCodeBlock variant={'chat'}>
            {systemRole}
          </Markdown>
        )}
        {tab === InfoTabs.comment && <Comment identifier={identifier} />}
      </Flexbox>
    </>
  );
});

export default AgentDetailContent;
