import { ProviderCombine } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useProviderItem } from '@/app/(main)/discover/features/useProviderList';
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
    min-height: 162px;

    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary}
      inset;

    transition: box-shadow 0.2s ${token.motionEaseInOut};

    &:hover {
      box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillSecondary : token.colorFill} inset;
    }
  `,
  desc: css`
    min-height: 44px;
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,

  safariIconWidthFix: css`
    color: ${token.colorText};

    svg {
      width: unset !important;
    }
  `,
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
  time: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    zoom: 1.2;
    margin-block-end: 0 !important;
    font-size: 18px !important;
    font-weight: bold;
  `,
  token: css`
    font-family: ${token.fontFamilyCode};
  `,
}));

export interface ProviderCardProps extends DiscoverProviderItem, FlexboxProps {}

const ProviderCard = memo<ProviderCardProps>(({ models, className, meta, identifier, ...rest }) => {
  const { description } = meta;
  const provider = useProviderItem(identifier);
  const { cx, styles, theme } = useStyles();

  if (!provider) return null;

  return (
    <Flexbox className={cx(styles.container, className)} gap={24} {...rest}>
      <Flexbox gap={12} padding={16}>
        <ProviderCombine
          className={styles.safariIconWidthFix}
          provider={identifier}
          size={28}
          title={provider.name}
        />
        <span style={{ color: theme.colorTextSecondary, fontSize: 12, marginTop: -8 }}>
          @{provider.name}
        </span>
        {description && (
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
        )}
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
    </Flexbox>
  );
});

export default ProviderCard;
