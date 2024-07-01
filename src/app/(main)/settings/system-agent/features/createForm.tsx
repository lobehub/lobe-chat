'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import ModelSelect from '@/features/ModelSelect';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { type UserSystemAgentConfigKey } from '@/types/user/settings';

import { useSyncSystemAgent } from './useSync';

type SettingItemGroup = ItemGroup;

const SystemAgentForm = memo(({ systemAgentKey }: { systemAgentKey: UserSystemAgentConfigKey }) => {
  const { t } = useTranslation('setting');

  const settings = useUserStore(settingsSelectors.currentSystemAgent, isEqual);
  const [updateSystemAgent] = useUserStore((s) => [s.updateSystemAgent]);

  const [form] = AntForm.useForm();

  const systemAgentSettings: SettingItemGroup = {
    children: [
      {
        children: (
          <ModelSelect
            onChange={(props) => {
              updateSystemAgent(systemAgentKey, props);
            }}
            showAbility={false}
          />
        ),
        desc: t(`systemAgent.${systemAgentKey}.modelDesc`),
        label: t(`systemAgent.${systemAgentKey}.label`),
        name: [systemAgentKey, 'model'],
      },
    ],
    title: t(`systemAgent.${systemAgentKey}.title`),
  };

  useSyncSystemAgent(form, settings);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[systemAgentSettings]}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default SystemAgentForm;
