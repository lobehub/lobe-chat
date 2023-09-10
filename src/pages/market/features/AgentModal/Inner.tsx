import { Avatar, Giscus, Markdown, Tag } from '@lobehub/ui';
import { Divider, Typography } from 'antd';
import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { selectors, useMarketStore } from '@/store/market';

import Loading from './Loading';
import { useStyles } from './style';

const { Text, Paragraph, Link } = Typography;

const AgentModalInner = memo(() => {
  const useFetchAgentManifest = useMarketStore((s) => s.useFetchAgentManifest);
  const agentManifest = useMarketStore(selectors.getAgentManifest, isEqual);
  const { styles, theme } = useStyles();
  const { mobile } = useResponsive();

  useFetchAgentManifest();

  if (!agentManifest) return <Loading />;

  const { config, meta, createAt, author, homepage, identifier } = agentManifest;
  const { systemRole } = config;
  const { avatar, title, description, tags, backgroundColor } = meta;

  const info = (
    <>
      <Flexbox gap={16} horizontal>
        <Avatar
          avatar={avatar}
          background={backgroundColor || theme.colorFillTertiary}
          className={styles.avatar}
          size={64}
        />
        <Flexbox>
          <Text className={styles.title}>{title}</Text>
          <div className={styles.date}>{createAt}</div>
          <Link className={styles.author} href={homepage} target={'_blank'}>
            @{author}
          </Link>
        </Flexbox>
      </Flexbox>
      <Paragraph className={styles.desc}>{description}</Paragraph>
      <div style={{ marginTop: '-16px' }}>
        {(tags as string[]).map((tag: string, index) => (
          <Tag
            key={index}
            onClick={() => useMarketStore.setState({ agentModalOpen: false, searchKeywords: tag })}
          >
            {startCase(tag).trim()}
          </Tag>
        ))}
      </div>
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

  if (mobile)
    return (
      <Flexbox flex={1} gap={8} style={{ paddingTop: 24 }}>
        {info}
        <Divider />
        {prompt}
      </Flexbox>
    );

  return (
    <Flexbox gap={32} horizontal>
      <Flexbox flex={1} gap={8}>
        {info}
        <Divider />
        {giscus}
      </Flexbox>
      <Flexbox className={styles.prompt} flex={1}>
        {prompt}
      </Flexbox>
    </Flexbox>
  );
});

export default AgentModalInner;
