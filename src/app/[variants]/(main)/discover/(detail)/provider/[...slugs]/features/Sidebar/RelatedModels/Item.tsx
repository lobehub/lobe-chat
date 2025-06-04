import { ModelIcon } from '@lobehub/icons';
import { Block } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DiscoverProviderDetailModelItem } from '@/types/discover';

const { Title, Paragraph } = Typography;

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

const RelatedItem = memo<DiscoverProviderDetailModelItem>(({ id, displayName }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('models');
  return (
    <Block gap={12} horizontal key={id} padding={12} variant={'outlined'}>
      <ModelIcon model={id} size={40} style={{ flex: 'none' }} type={'avatar'} />
      <Flexbox
        flex={1}
        gap={6}
        style={{
          overflow: 'hidden',
        }}
      >
        <Title
          className={styles.title}
          ellipsis={{
            rows: 1,
          }}
          level={2}
        >
          {displayName || id}
        </Title>
        <Paragraph
          className={styles.desc}
          ellipsis={{
            rows: 2,
          }}
        >
          {t(`${id}.description`)}
        </Paragraph>
      </Flexbox>
    </Block>
  );
});

export default RelatedItem;
