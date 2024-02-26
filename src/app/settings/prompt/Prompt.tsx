'use client';

import { ActionIcon, EditableMessage, Form, Input, ItemGroup } from '@lobehub/ui';
import { useSetState } from 'ahooks';
import { Form as AntForm, message } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { clone, findIndex } from 'lodash-es';
import { Wand2 } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { v4 } from 'uuid';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/slices/settings/selectors';

export default memo(() => {
  const theme = useTheme();
  const [form] = AntForm.useForm();
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useGlobalStore((s) => [s.setSettings]);
  const { t } = useTranslation('setting');
  const userPrompts = useMemo(() => {
    return settings.userPrompts;
  }, [settings]);
  const [prompt, setPrompt] = useSetState({
    content: '',
    id: null as null | string,
    name: '',
  });

  const onChange = useCallback(
    (id: string | null, name: string, content: string) => {
      if (name && content) {
        const cloneUserPrompts = clone(userPrompts);
        const changedPrompt = {
          content,
          id: id || v4(),
          name,
        };
        const index = findIndex(userPrompts, (p) => p.id === changedPrompt.id);

        if (index !== -1) {
          cloneUserPrompts[index] = changedPrompt;
        } else {
          cloneUserPrompts.push(changedPrompt);
        }

        setSettings({
          userPrompts: cloneUserPrompts,
        });

        message.success(t('settingPrompt.save.success'));
      } else {
        message.error(t('settingPrompt.save.error'));
      }

      setPrompt({
        content: '',
        id: null,
        name: '',
      });
    },
    [userPrompts],
  );

  const input: ItemGroup = {
    children: (
      <Flexbox gap={16} paddingBlock={16}>
        <Input
          onChange={(e) => setPrompt({ name: e.target.value })}
          placeholder={t('settingPrompt.input.placeholderName1')}
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
          value={prompt.name}
        />
        <EditableMessage
          editButtonSize={'small'}
          height={'auto'}
          inputType={'ghost'}
          onChange={(content) => onChange(prompt.id, prompt.name, content)}
          placeholder={t('settingPrompt.input.placeholderContent1')}
          showEditWhenEmpty
          text={{
            cancel: t('cancel', { ns: 'common' }),
            confirm: t('ok', { ns: 'common' }),
          }}
          value={prompt.content}
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
