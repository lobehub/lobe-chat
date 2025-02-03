import { Avatar } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { CSSProperties, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DiscoverPlugintem } from '@/types/discover';

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
  title: css`
    margin-block-end: 0 !important;
    font-size: 16px !important;
    font-weight: 500 !important;
  `,
}));

export interface SuggestionItemProps
  extends Omit<DiscoverPlugintem, 'suggestions' | 'socialData' | 'category' | 'manifest'> {
  className?: string;
  style?: CSSProperties;
}

const SuggestionItem = memo<SuggestionItemProps>(({ className, meta, identifier, style }) => {
  const { avatar, title, description } = meta;

  const { cx, styles, theme } = useStyles();

  return (
    <Flexbox className={cx(styles.container, className)} gap={12} key={identifier} style={style}>
      <Flexbox align={'center'} gap={12} horizontal width={'100%'}>
        <Avatar
          alt={title}
          avatar={avatar}
          background={theme.colorFillTertiary}
          size={36}
          title={title}
        />
        <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
          {title}
        </Title>
      </Flexbox>
      <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
        {description}
      </Paragraph>
    </Flexbox>
  );
});

export default SuggestionItem;
