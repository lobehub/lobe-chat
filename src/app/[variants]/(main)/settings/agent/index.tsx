'use client';

import { Tabs } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { INBOX_SESSION_ID } from '@/const/session';
import { AgentSettings } from '@/features/AgentSetting';
import { useCategory } from '@/features/AgentSetting/AgentCategory/useCategory';
import { parseAsString, useQueryState } from '@/hooks/useQueryParam';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import DesktopLayout from './_layout/Desktop';
import MobileLayout from './_layout/Mobile';

type AgentPageType = {
  mobile?: boolean;
};

const Page = memo((props: AgentPageType) => {
  const { mobile } = props;
  const cateItems = useCategory();
  const [tab, setTab] = useQueryState('tab', parseAsString.withDefault(ChatSettingsTabs.Prompt));
  const config = useUserStore(settingsSelectors.defaultAgentConfig, isEqual);
  const meta = useUserStore(settingsSelectors.defaultAgentMeta, isEqual);
  const [updateAgent, isUserStateInit] = useUserStore((s) => [
    s.updateDefaultAgent,
    s.isUserStateInit,
  ]);

  const theme = useTheme();

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const PageContent = (
    <>
      {mobile && (
        <Tabs
          activeKey={tab}
          compact
          items={cateItems as any}
          onChange={(value) => setTab(value as ChatSettingsTabs)}
          style={{
            borderBottom: `1px solid ${theme.colorBorderSecondary}`,
          }}
        />
      )}
      <AgentSettings
        config={config}
        id={INBOX_SESSION_ID}
        loading={!isUserStateInit}
        meta={meta}
        onConfigChange={(config) => {
          updateAgent({ config });
        }}
        onMetaChange={(meta) => {
          updateAgent({ meta });
        }}
        tab={tab as ChatSettingsTabs}
      />
    </>
  );

  return mobile ? (
    <MobileLayout>{PageContent}</MobileLayout>
  ) : (
    <DesktopLayout>{PageContent}</DesktopLayout>
  );
});

Page.displayName = 'AgentSetting';

export default Page;
