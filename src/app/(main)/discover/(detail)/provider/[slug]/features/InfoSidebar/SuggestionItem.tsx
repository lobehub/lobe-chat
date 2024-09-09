import { ProviderCombine } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverProviderItem } from '@/types/discover';

const { Paragraph } = Typography;

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
  safariIconWidthFix: css`
    color: ${token.colorText};

    svg {
      width: unset !important;
    }
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
  extends Omit<DiscoverProviderItem, 'suggestions' | 'socialData'>,
    FlexboxProps {}

const SuggestionItem = memo<SuggestionItemProps>(
  ({ className, meta, identifier, models, ...rest }) => {
    const { title, description } = meta;

    const { cx, styles } = useStyles();

    return (
      <Flexbox className={cx(styles.container, className)} gap={12} key={identifier} {...rest}>
        <ProviderCombine
          className={styles.safariIconWidthFix}
          provider={identifier}
          size={24}
          title={title}
        />
        <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
          {title}
          {' | '}
          {description || '服务商介绍'}
        </Paragraph>
        <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
          {(models as string[])
            .slice(0, 3)
            .filter(Boolean)
            .map((tag: string, index) => (
              <Link href={urlJoin('/discover/model', tag)} key={tag}>
                <Tag key={index} style={{ margin: 0 }}>
                  {tag}
                </Tag>
              </Link>
            ))}
          {models.length > 3 && <Tag>+{models.length - 3}</Tag>}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default SuggestionItem;
