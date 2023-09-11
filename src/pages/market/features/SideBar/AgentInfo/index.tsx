import { Markdown, TabsNav } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import TokenTag from '@/pages/market/features/SideBar/AgentInfo/TokenTag';
import { useMarketStore } from '@/store/market';

import AgentCardBanner from '../../AgentCard/AgentCardBanner';
import Comment from './Comment';
import Header from './Header';
import Loading from './Loading';
import { useStyles } from './style';

enum InfoTabs {
  comment = 'comment',
  prompt = 'prompt',
}

const AgentModalInner = memo(() => {
  const [useFetchAgent, currentIdentifier] = useMarketStore((s) => [
    s.useFetchAgent,
    s.currentIdentifier,
  ]);
  const { styles } = useStyles();
  const { data, isLoading } = useFetchAgent(currentIdentifier);
  const { t } = useTranslation('market');
  const [tab, setTab] = useState<string>(InfoTabs.prompt);

  if (isLoading || !data?.meta) return <Loading />;

  const { config, meta, identifier } = data;
  const { systemRole } = config;

  return (
    <>
      <AgentCardBanner mask meta={meta} size={10} style={{ height: 120, marginBottom: -60 }} />

      <Header {...data} />
      <Flexbox align={'center'}>
        <TabsNav
          activeKey={tab}
          className={styles.nav}
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
        />
      </Flexbox>
      <Flexbox style={{ padding: 16 }}>
        {tab === InfoTabs.prompt && <Markdown fullFeaturedCodeBlock>{systemRole}</Markdown>}
        {tab === InfoTabs.comment && <Comment identifier={identifier} />}
      </Flexbox>
    </>
  );
});

export default AgentModalInner;
