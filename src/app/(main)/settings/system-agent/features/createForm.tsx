'use client';

import { Form, Icon, type ItemGroup } from '@lobehub/ui';
import type { FormItemProps } from '@lobehub/ui/es/Form/components/FormItem';
import { Form as AntForm, Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { PencilIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import TextArea from '@/components/TextArea';
import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_REWRITE_QUERY } from '@/const/settings';
import ModelSelect from '@/features/ModelSelect';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { type UserSystemAgentConfigKey } from '@/types/user/settings';

import { useSyncSystemAgent } from './useSync';

type SettingItemGroup = ItemGroup;

interface SystemAgentFormProps {
  allowCustomPrompt?: boolean;
  systemAgentKey: UserSystemAgentConfigKey;
}

const SystemAgentForm = memo(({ systemAgentKey, allowCustomPrompt }: SystemAgentFormProps) => {
  const { t } = useTranslation('setting');

  const settings = useUserStore(settingsSelectors.currentSystemAgent, isEqual);
  const [updateSystemAgent] = useUserStore((s) => [s.updateSystemAgent]);

  const [form] = AntForm.useForm();
  const value = settings[systemAgentKey];

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
      (!!allowCustomPrompt && {
        children: !!value.customPrompt ? (
          <TextArea
            onChange={(e) => {
              updateSystemAgent(systemAgentKey, { customPrompt: e });
            }}
            placeholder={t('systemAgent.customPrompt.placeholder')}
            style={{ minHeight: 160 }}
            value={value.customPrompt}
          />
        ) : (
          <Button
            block
            icon={<Icon icon={PencilIcon} />}
            onClick={async () => {
              await updateSystemAgent(systemAgentKey, { customPrompt: DEFAULT_REWRITE_QUERY });
            }}
          >
            {t('systemAgent.customPrompt.addPrompt')}
          </Button>
        ),
        desc: t('systemAgent.customPrompt.desc'),
        label: t('systemAgent.customPrompt.title'),
        name: [systemAgentKey, 'customPrompt'],
      }) as FormItemProps,
    ].filter(Boolean),
    title: t(`systemAgent.${systemAgentKey}.title`),
  };

  useSyncSystemAgent(form, settings);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[systemAgentSettings]}
      // variant={'block'}
      {...FORM_STYLE}
    />
  );
});

export default SystemAgentForm;
