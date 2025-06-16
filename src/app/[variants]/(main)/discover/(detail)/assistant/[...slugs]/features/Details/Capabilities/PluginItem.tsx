import { Avatar, Block, Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useDiscoverStore } from '@/store/discover';

const useStyles = createStyles(({ css, token }) => {
  return {
    desc: css`
      flex: 1;
      margin: 0 !important;
      font-size: 14px !important;
      color: ${token.colorTextSecondary};
    `,
    title: css`
      margin: 0 !important;
      font-size: 14px !important;
      font-weight: 500 !important;

      &:hover {
        color: ${token.colorLink};
      }
    `,
  };
});

const PluginItem = memo<{ identifier: string }>(({ identifier }) => {
  const usePluginDetail = useDiscoverStore((s) => s.usePluginDetail);
  const { data, isLoading } = usePluginDetail({ identifier, withManifest: false });
  const { styles } = useStyles();

  if (isLoading || !data)
    return (
      <Block gap={12} horizontal key={identifier} padding={12} variant={'outlined'}>
        <Skeleton paragraph={{ rows: 1 }} title={false} />
      </Block>
    );

  return (
    <Block gap={12} horizontal key={identifier} padding={12} variant={'outlined'}>
      <Avatar avatar={data.avatar} size={40} style={{ flex: 'none' }} />
      <Flexbox
        flex={1}
        gap={6}
        style={{
          overflow: 'hidden',
        }}
      >
        <Text as={'h2'} className={styles.title} ellipsis>
          {data.title}
        </Text>
        <Text
          as={'p'}
          className={styles.desc}
          ellipsis={{
            rows: 2,
          }}
        >
          {data.description}
        </Text>
      </Flexbox>
    </Block>
  );
});

export default PluginItem;
