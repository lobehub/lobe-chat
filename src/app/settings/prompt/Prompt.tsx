'use client';

import { Form, ItemGroup } from '@lobehub/ui';
import { Form as AntForm } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import EditableUserPromptList from '@/app/settings/prompt/EditableUserPromptList';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/slices/settings/selectors';

export default memo(() => {
  const [form] = AntForm.useForm();
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useGlobalStore((s) => [s.setSettings]);
  const { t } = useTranslation('setting');

  const input: ItemGroup = {
    children: (
      <Flexbox gap={16} paddingBlock={16}>
        <EditableUserPromptList
          dataSources={settings.userPrompts}
          onChange={(userPrompts) =>
            setSettings({
              userPrompts,
            })
          }
        />
      </Flexbox>
    ),
    title: t('settingPrompt.title'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[input]}
      onValuesChange={setSettings}
      {...FORM_STYLE}
    />
  );
});
