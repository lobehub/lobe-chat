import { Avatar, Tag } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { Typography } from 'antd';
import { startCase } from 'lodash-es';
import { memo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';
import { AgentsMarketIndexItem } from '@/types/market';

import { useStyles } from './style';

const { Text, Paragraph } = Typography;

const GridCardItem = memo<AgentsMarketIndexItem>(({ meta, manifest }) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const { avatar, title, description, tags, backgroundColor } = meta;
  const { styles, theme } = useStyles();
  return (
    <Flexbox
      className={styles.container}
      onClick={() => useMarketStore.setState({ agentManifestUrl: manifest, agentModalOpen: true })}
    >
      <Flexbox align={'flex-end'} className={styles.banner} justify={'center'}>
        <Avatar
          avatar={avatar}
          background={backgroundColor || theme.colorBgContainer}
          className={styles.bannerImg}
          size={320}
        />
      </Flexbox>
      <Flexbox className={styles.inner} gap={8} ref={ref}>
        <Avatar
          animation={isHovering}
          avatar={avatar}
          background={backgroundColor || theme.colorBgContainer}
          className={styles.avatar}
          size={56}
        />
        <Text className={styles.title} ellipsis={{ tooltip: title }}>
          {title}
        </Text>
        <Paragraph className={styles.desc} ellipsis={{ rows: 3, tooltip: description }}>
          {description}
        </Paragraph>
        <div>
          {(tags as string[]).map((tag: string, index) => (
            <Tag key={index}>{startCase(tag).trim()}</Tag>
          ))}
        </div>
      </Flexbox>
    </Flexbox>
  );
});

export default GridCardItem;
