import { ProviderCombine } from '@lobehub/icons';
import { Divider, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { ModelProviderCard } from '@/types/llm';

const { Paragraph } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    position: relative;

    overflow: hidden;

    height: 100%;

    background: ${token.colorBgContainer};
    border-radius: 12px;
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

export interface ProviderCardProps extends ModelProviderCard {
  mobile?: boolean;
}

const ProviderCard = memo<ProviderCardProps>(({ id, description, name }) => {
  const { t } = useTranslation('providers');
  const { cx, styles, theme } = useStyles();
  const [toggleProviderEnabled] = useUserStore((s) => [s.toggleProviderEnabled]);
  const enabled = useUserStore(modelProviderSelectors.isProviderEnabled(id as any));
  const [checked, setChecked] = useState(enabled);

  return (
    <Flexbox className={cx(styles.container)} gap={24}>
      <Flexbox gap={12} padding={16} width={'100%'}>
        <Flexbox align={'center'} horizontal justify={'space-between'}>
          <Link href={`/settings/provider/${id}`}>
            <ProviderCombine
              provider={id}
              size={24}
              style={{ color: theme.colorText }}
              title={name}
            />
          </Link>
        </Flexbox>
        {description && (
          <Paragraph className={styles.desc} ellipsis={{ rows: 2, tooltip: true }}>
            {t(`${id}.description`)}
          </Paragraph>
        )}
        <Divider style={{ margin: '4px 0' }} />
        <Flexbox horizontal justify={'space-between'} paddingBlock={'8px 0'}>
          <div />
          <Switch
            checked={checked}
            onChange={(checked) => {
              setChecked(checked);
              toggleProviderEnabled(id as any, checked);
            }}
            // size={'small'}
          />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default ProviderCard;
