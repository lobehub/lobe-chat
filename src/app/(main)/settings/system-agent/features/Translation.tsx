'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import ModelSelect from '@/features/ModelSelect';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { useSyncSystemAgent } from './useSync';

type SettingItemGroup = ItemGroup;

const systemAgentKey = 'translation'
const Translation = memo(() => {
  const { t } = useTranslation('setting');

  const settings = useUserStore(settingsSelectors.currentSystemAgent, isEqual);
  const [updateSystemAgent] = useUserStore((s) => [s.updateSystemAgent]);

  const [form] = AntForm.useForm();
  useEffect(() => {
    form.setFieldsValue(settings);
  }, [settings]);

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

  useSyncSystemAgent(form);

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

export default Translation;
