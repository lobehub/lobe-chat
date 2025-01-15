import { Avatar } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverAssistantItem } from '@/types/discover';

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
  extends Omit<DiscoverAssistantItem, 'suggestions' | 'socialData' | 'category' | 'config'>,
    FlexboxProps {}

const SuggestionItem = memo<SuggestionItemProps>(({ className, meta, identifier, ...rest }) => {
  const { avatar, title, description, backgroundColor } = meta;

  const { cx, styles, theme } = useStyles();

  return (
    <Flexbox className={cx(styles.container, className)} gap={12} key={identifier} {...rest}>
      <Flexbox align={'center'} gap={12} horizontal width={'100%'}>
        <Avatar
          alt={title}
          avatar={avatar}
          background={backgroundColor || theme.colorFillTertiary}
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
