import { ModelIcon } from '@lobehub/icons';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverModelItem } from '@/types/discover';

import ModelFeatureTags from '../../../../../features/ModelFeatureTags';

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    cursor: pointer;
    position: relative;
    overflow: hidden;
    height: 100%;
  `,
  desc: css`
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,
  id: css`
    margin-block-end: 0 !important;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block-end: 0 !important;
    font-size: 16px !important;
    font-weight: 500 !important;
  `,
  token: css`
    font-family: ${token.fontFamilyCode};
  `,
}));

export interface SuggestionItemProps
  extends Omit<DiscoverModelItem, 'suggestions' | 'socialData' | 'providers'>,
    FlexboxProps {}

const SuggestionItem = memo<SuggestionItemProps>(({ className, meta, identifier }) => {
  const { title, description, contextWindowTokens, vision, functionCall } = meta;
  const { t } = useTranslation('models');
  const { cx, styles } = useStyles();

  return (
    <Flexbox className={cx(styles.container, className)} gap={12} key={identifier}>
      <Flexbox align={'center'} gap={12} horizontal width={'100%'}>
        <ModelIcon model={identifier} size={36} type={'avatar'} />
        <Flexbox style={{ overflow: 'hidden' }}>
          <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
            {title}
          </Title>
          <Paragraph className={styles.id} ellipsis={{ rows: 1 }}>
            {identifier}
          </Paragraph>
        </Flexbox>
      </Flexbox>
      {description && (
        <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
          {t(`${identifier}.description`)}
        </Paragraph>
      )}
      <ModelFeatureTags functionCall={functionCall} tokens={contextWindowTokens} vision={vision} />
    </Flexbox>
  );
});

export default SuggestionItem;
