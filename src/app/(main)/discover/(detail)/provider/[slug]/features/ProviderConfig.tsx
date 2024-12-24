'use client';

import { Icon } from '@lobehub/ui';
import { Button, ButtonProps, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronDownIcon, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexboxProps } from 'react-layout-kit';

import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { SettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { DiscoverProviderItem } from '@/types/discover';

const useStyles = createStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

interface ProviderConfigProps extends FlexboxProps {
  data: DiscoverProviderItem;
  identifier: string;
}

const ProviderConfig = memo<ProviderConfigProps>(({ data }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('discover');
  const openSettings = useOpenSettings(SettingsTabs.LLM);
  const { showLLM } = useServerConfigStore(featureFlagsSelectors);

  const icon = <Icon icon={SquareArrowOutUpRight} size={{ fontSize: 16 }} />;

  const items = [
    data.meta?.url && {
      icon,
      key: 'officialSite',
      label: (
        <Link href={data.meta.url} target={'_blank'}>
          {t('providers.officialSite')}
        </Link>
      ),
    },
    data.meta?.modelsUrl && {
      icon,
      key: 'modelSite',
      label: (
        <Link href={data.meta.modelsUrl} target={'_blank'}>
          {t('providers.modelSite')}
        </Link>
      ),
    },
  ].filter(Boolean) as any;

  if (!items || items?.length === 0)
    return (
      <Button
        disabled={!showLLM}
        onClick={openSettings}
        size={'large'}
        style={{ flex: 1 }}
        type={'primary'}
      >
        {t('providers.config')}
      </Button>
    );

  return (
    <Dropdown.Button
      buttonsRender={(buttons) => {
        const [leftButton, rightButton] = buttons as React.ReactElement<ButtonProps>[];
        return [{ ...leftButton, props: { ...leftButton.props, disabled: !showLLM } }, rightButton];
      }}
      className={styles.button}
      icon={<Icon icon={ChevronDownIcon} />}
      menu={{ items }}
      onClick={openSettings}
      overlayStyle={{ minWidth: 267 }}
      size={'large'}
      style={{ flex: 1, width: 'unset' }}
      type={'primary'}
    >
      {t('providers.config')}
    </Dropdown.Button>
  );
});

export default ProviderConfig;
