'use client';

import { ActionIcon, Avatar, Block, Grid, Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useDiscoverStore } from '@/store/discover';
import { DiscoverAssistantItem } from '@/types/discover';

const useStyles = createStyles(({ css, token, responsive }) => ({
  card: css`
    position: relative;

    overflow: hidden;

    height: 100%;
    min-height: 110px;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    ${responsive.mobile} {
      min-height: 72px;
    }
  `,
  cardDesc: css`
    margin-block: 0 !important;
    color: ${token.colorTextDescription};
  `,
  cardTitle: css`
    margin-block: 0 !important;
    font-size: 16px;
    font-weight: bold;
  `,
  icon: css`
    color: ${token.colorTextSecondary};
  `,
  title: css`
    color: ${token.colorTextDescription};
  `,
}));

const AgentsSuggest = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('welcome');
  const [page, setPage] = useState(1);
  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);

  const { data: assistantList, isLoading } = useAssistantList({
    page,
    pageSize: mobile ? 2 : 4,
  });

  const { styles } = useStyles();

  const loadingCards = Array.from({ length: mobile ? 2 : 4 }).map((_, index) => (
    <Block className={styles.card} key={index}>
      <Skeleton active avatar paragraph={{ rows: 2 }} title={false} />
    </Block>
  ));

  const handleRefresh = () => {
    if (!assistantList) return;
    setPage(page + 1);
  };

  // if no assistant data, just hide the component
  if (!isLoading && !assistantList?.items?.length) return null;

  return (
    <Flexbox gap={8} width={'100%'}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <div className={styles.title}>{t('guide.agents.title')}</div>
        <ActionIcon
          icon={RefreshCw}
          onClick={handleRefresh}
          size={{ blockSize: 24, size: 14 }}
          title={t('guide.agents.replaceBtn')}
        />
      </Flexbox>
      <Grid gap={8} rows={2}>
        {isLoading || !assistantList
          ? loadingCards
          : assistantList.items.map((item: DiscoverAssistantItem) => (
              <Link
                href={urlJoin('/discover/assistant', item.identifier)}
                key={item.identifier}
                prefetch={false}
              >
                <Block className={styles.card} clickable gap={12} horizontal variant={'outlined'}>
                  <Avatar avatar={item.avatar} style={{ flex: 'none' }} />
                  <Flexbox gap={2} style={{ overflow: 'hidden', width: '100%' }}>
                    <Text className={styles.cardTitle} ellipsis={{ rows: 1 }}>
                      {item.title}
                    </Text>
                    <Text className={styles.cardDesc} ellipsis={{ rows: mobile ? 1 : 2 }}>
                      {item.description}
                    </Text>
                  </Flexbox>
                </Block>
              </Link>
            ))}
      </Grid>
    </Flexbox>
  );
});

export default AgentsSuggest;
