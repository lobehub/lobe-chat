import { ModelIcon } from '@lobehub/icons';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import Tags from '@/app/(main)/discover/(detail)/model/[slug]/features/Tags';
import { DiscoverModelItem } from '@/types/discover';

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

const ModelItem = memo<SuggestionItemProps>(({ className, meta, identifier, ...rest }) => {
  const { title, description, tokens, vision, functionCall } = meta;

  const { cx, styles } = useStyles();

  return (
    <Flexbox
      className={cx(styles.container, className)}
      gap={12}
      horizontal
      key={identifier}
      padding={16}
      {...rest}
    >
      <Flexbox flex={1} gap={12}>
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
        <Tags functionCall={functionCall} tokens={tokens} vision={vision} />
      </Flexbox>
      <Flexbox flex={2} gap={12}>
        {description && (
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default ModelItem;
