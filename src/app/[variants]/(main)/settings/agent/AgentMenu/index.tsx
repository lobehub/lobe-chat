'use client';

import { Alert } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { useQueryState } from 'nuqs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { AgentCategory } from '@/features/AgentSetting';
import { ChatSettingsTabs } from '@/store/global/initialState';

interface ProviderMenuProps {
  mobile?: boolean;
}
const ProviderMenu = memo(({ mobile }: ProviderMenuProps) => {
  const theme = useTheme();
  const { t } = useTranslation('setting');
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: ChatSettingsTabs.Prompt,
  });

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
      <AgentCategory setTab={setTab} tab={tab} />
    </Flexbox>
  );
});

export default ProviderMenu;
