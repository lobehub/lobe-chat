'use client';

import { ActionIcon, EditableMessage, Form, Input, ItemGroup } from '@lobehub/ui';
import { Form as AntForm } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Wand2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/slices/settings/selectors';

export default memo(() => {
  const theme = useTheme();
  const [form] = AntForm.useForm();
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useGlobalStore((s) => [s.setSettings]);
  const { t } = useTranslation('setting');

  const input: ItemGroup = {
    children: (
      <Flexbox gap={16} paddingBlock={16}>
        <Input
          placeholder={t('settingPrompt.input.placeholderName')}
          suffix={
            <ActionIcon
              active
              icon={Wand2}
              loading={false}
              onClick={() => {}}
              size={'small'}
              style={{
                color: theme.colorInfo,
                marginRight: -4,
              }}
              title={t('settingPrompt.input.autoGenerate')}
            />
          }
        />
        <EditableMessage
          editButtonSize={'small'}
          height={'auto'}
          inputType={'ghost'}
          onChange={() => {}}
          placeholder={t('settingPrompt.input.placeholderContent')}
          showEditWhenEmpty
          text={{
            cancel: t('cancel', { ns: 'common' }),
            confirm: t('ok', { ns: 'common' }),
          }}
          value={''}
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
