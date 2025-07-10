'use client';

import { Alert } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Menu from './Menu';

interface ProviderMenuProps {
  mobile?: boolean;
}
const ProviderMenu = memo(({ mobile }: ProviderMenuProps) => {
  const theme = useTheme();
  const { t } = useTranslation('setting');

  const width = mobile ? undefined : 260;
  return (
    <Flexbox
      gap={24}
      paddingBlock={28}
      paddingInline={12}
      style={{
        background: theme.colorBgLayout,
        borderRight: `1px solid ${theme.colorBorderSecondary}`,
        minWidth: width,
        overflow: mobile ? undefined : 'scroll',
      }}
      width={width}
    >
      <Alert
        message={t('systemAgent.helpInfo')}
        style={{
          borderRadius: theme.borderRadius,
        }}
        variant={'filled'}
      />
      <Suspense
        fallback={
          <Flexbox gap={4} paddingBlock={8} paddingInline={8}>
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          </Flexbox>
        }
      >
        <Menu />
      </Suspense>
    </Flexbox>
  );
});

export default ProviderMenu;
