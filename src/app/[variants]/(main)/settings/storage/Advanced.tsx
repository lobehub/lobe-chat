'use client';

import { Form, Icon, type ItemGroup } from '@lobehub/ui';
import { App, Button, Dropdown, Space } from 'antd';
import isEqual from 'fast-deep-equal';
import { ChevronDown, HardDriveDownload, HardDriveUpload } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import DataImporter from '@/features/DataImporter';
import { configService } from '@/services/config';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';
import { useSessionStore } from '@/store/session';
import { useToolStore } from '@/store/tool';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const AdvancedActions = () => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const [clearSessions, clearSessionGroups] = useSessionStore((s) => [
    s.clearSessions,
    s.clearSessionGroups,
  ]);
  const [clearTopics, clearAllMessages] = useChatStore((s) => [
    s.removeAllTopics,
    s.clearAllMessages,
  ]);
  const [removeAllFiles] = useFileStore((s) => [s.removeAllFiles]);
  const removeAllPlugins = useToolStore((s) => s.removeAllPlugins);
  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);

  const handleClear = useCallback(() => {
    modal.confirm({
      centered: true,
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        await clearSessions();
        await removeAllPlugins();
        await clearTopics();
        await removeAllFiles();
        await clearAllMessages();
        await clearSessionGroups();

        message.success(t('danger.clear.success'));
      },
      title: t('danger.clear.confirm'),
    });
  }, []);

  const system: ItemGroup = {
    children: [
      {
        children: (
          <DataImporter>
            <Button icon={<Icon icon={HardDriveDownload} />}>
              {t('storage.actions.import.button')}
            </Button>
          </DataImporter>
        ),
        label: t('storage.actions.import.title'),
        minWidth: undefined,
      },
      {
        children: (
          <Space.Compact>
            <Button
              icon={<Icon icon={HardDriveUpload} />}
              onClick={() => {
                configService.exportAll();
              }}
            >
              {t('storage.actions.export.button')}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'allAgent',
                    label: t('storage.actions.export.exportType.allAgent'),
                    onClick: configService.exportAgents,
                  },
                  {
                    key: 'allAgentWithMessage',
                    label: t('storage.actions.export.exportType.allAgentWithMessage'),
                    onClick: configService.exportSessions,
                  },
                  {
                    key: 'globalSetting',
                    label: t('storage.actions.export.exportType.globalSetting'),
                    onClick: configService.exportSettings,
                  },
                ],
              }}
            >
              <Button icon={<Icon icon={ChevronDown} />} />
            </Dropdown>
          </Space.Compact>
        ),
        label: t('storage.actions.export.title'),
        minWidth: undefined,
      },
      {
        children: (
          <Button danger onClick={handleClear} type="primary">
            {t('danger.clear.action')}
          </Button>
        ),
        desc: t('danger.clear.desc'),
        label: t('danger.clear.title'),
        minWidth: undefined,
      },
    ],
    title: t('storage.actions.title'),
  };
  return (
    <Form
      form={form}
      initialValues={settings}
      items={[system]}
      itemsType={'group'}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
};

export default AdvancedActions;
