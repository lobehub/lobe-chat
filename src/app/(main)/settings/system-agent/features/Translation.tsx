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

import { useSyncSettings } from '../../hooks/useSyncSettings';

const SYSTEM_AGENT_SETTING_KEY = 'systemAgent';

type SettingItemGroup = ItemGroup;

const Translation = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setTranslationSystemAgent] = useUserStore((s) => [s.setTranslationSystemAgent]);

  const systemAgentSettings: SettingItemGroup = {
    children: [
      {
        children: (
          <ModelSelect
            onChange={(props) => {
              setTranslationSystemAgent(props.provider, props.model);
            }}
          />
        ),
        desc: t('systemAgent.translation.modelDesc'),
        label: t('systemAgent.translation.label'),
        name: [SYSTEM_AGENT_SETTING_KEY, 'translation', 'model'],
      },
    ],
    title: t('systemAgent.translation.title'),
  };

  useSyncSettings(form);

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
