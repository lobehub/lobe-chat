import { Avatar, Giscus, Markdown, TabsNav, Tag } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import { startCase } from 'lodash-es';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';

import AgentCardBanner from '../../AgentCard/AgentCardBanner';
import Loading from './Loading';
import { useStyles } from './style';

const { Link } = Typography;

enum InfoTabs {
  comment = 'comment',
  prompt = 'prompt',
}

const AgentModalInner = memo<{ url: string }>(({ url }) => {
  const useFetchAgentManifest = useMarketStore((s) => s.useFetchAgentManifest);
  const { styles, theme } = useStyles();
  const { data, isLoading } = useFetchAgentManifest(url);
  const { t } = useTranslation('market');
  const [tab, setTab] = useState<string>(InfoTabs.prompt);
  if (isLoading || !data?.meta) return <Loading />;

  const { config, meta, createAt, author, homepage, identifier } = data;
  const { systemRole } = config;
  const { avatar, title, description, tags, backgroundColor } = meta;

  const info = (
    <>
      <Avatar
        avatar={avatar}
        background={backgroundColor || theme.colorFillTertiary}
        className={styles.avatar}
        size={100}
      />

      <div className={styles.title}>{title}</div>
      <div>
        {(tags as string[]).map((tag: string, index) => (
          <Tag key={index} onClick={() => useMarketStore.setState({ searchKeywords: tag })}>
            {startCase(tag).trim()}
          </Tag>
        ))}
      </div>
      <div className={styles.desc}>{description}</div>
      <Link className={styles.author} href={homepage} target={'_blank'}>
        @{author}
      </Link>
      <Button block type={'primary'}>
        {t('addAgent')}
      </Button>
      <div className={styles.date}>{createAt}</div>
    </>
  );

  const giscus = (
    <Giscus
      category="General"
      categoryId="DIC_kwDOKON5YM4CZNRJ"
      id="lobehub"
      mapping="specific"
      repo="lobehub/lobe-chat-agents"
      repoId="R_kgDOKON5YA"
      term={identifier}
    />
  );

  const prompt = <Markdown fullFeaturedCodeBlock>{systemRole}</Markdown>;

  return (
    <>
      <AgentCardBanner mask meta={meta} size={10} style={{ height: 120, marginBottom: -60 }} />
      <Center className={styles.container} gap={16}>
        {info}
      </Center>
      <Flexbox align={'center'}>
        <TabsNav
          activeKey={tab}
          className={styles.nav}
          items={[
            {
              key: InfoTabs.prompt,
              label: t('sidebar.prompt'),
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
        {tab === InfoTabs.prompt && prompt}
        {tab === InfoTabs.comment && giscus}
      </Flexbox>
    </>
  );
});

export default AgentModalInner;
