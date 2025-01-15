import { ProviderCombine, ProviderIcon } from '@lobehub/icons';
import { Avatar } from '@lobehub/ui';
import { Divider, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InstantSwitch from '@/components/InstantSwitch';
import { useAiInfraStore } from '@/store/aiInfra';
import { AiProviderListItem } from '@/types/aiProvider';

const { Paragraph } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    position: relative;

    overflow: hidden;

    height: 100%;
    border-radius: 12px;

    background: ${token.colorBgContainer};
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

interface ProviderCardProps extends AiProviderListItem {
  loading?: boolean;
}
const ProviderCard = memo<ProviderCardProps>(
  ({ id, description, name, enabled, source, logo, loading }) => {
    const { t } = useTranslation('providers');
    const { cx, styles, theme } = useStyles();
    const toggleProviderEnabled = useAiInfraStore((s) => s.toggleProviderEnabled);

    if (loading)
      return (
        <Flexbox className={cx(styles.container)} gap={24} padding={16}>
          <Skeleton active />
        </Flexbox>
      );

    return (
      <Flexbox className={cx(styles.container)} gap={24}>
        <Flexbox gap={12} padding={16} width={'100%'}>
          <Link href={`/settings/provider/${id}`}>
            <Flexbox gap={12} width={'100%'}>
              <Flexbox align={'center'} horizontal justify={'space-between'}>
                {source === 'builtin' ? (
                  <ProviderCombine
                    provider={id}
                    size={24}
                    style={{ color: theme.colorText }}
                    title={name}
                  />
                ) : (
                  <Flexbox align={'center'} gap={12} horizontal>
                    {logo ? (
                      <Avatar alt={name || id} avatar={logo} size={28} />
                    ) : (
                      <ProviderIcon
                        provider={id}
                        size={24}
                        style={{ borderRadius: 6 }}
                        type={'avatar'}
                      />
                    )}
                    <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      {name || id}
                    </Typography.Text>
                  </Flexbox>
                )}
              </Flexbox>
              <Paragraph className={styles.desc} ellipsis={{ rows: 2, tooltip: true }}>
                {source === 'custom' ? description : t(`${id}.description`)}
              </Paragraph>
            </Flexbox>
          </Link>
          <Divider style={{ margin: '4px 0' }} />
          <Flexbox horizontal justify={'space-between'} paddingBlock={'8px 0'}>
            <div />
            <InstantSwitch
              enabled={enabled}
              onChange={async (checked) => {
                await toggleProviderEnabled(id, checked);
              }}
              size={'small'}
            />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ProviderCard;
