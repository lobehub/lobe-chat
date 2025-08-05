'use client';

import { McpInstallSchema } from '@lobechat/electron-client-ipc';
import { Alert, Block, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';

import ConfigDisplay from './ConfigDisplay';
import { ModalConfig } from './types';

const CustomPluginModal = memo<{ schema?: McpInstallSchema }>(({ schema }) => {
  const { t } = useTranslation('plugin');

  if (!schema) return null;

  return (
    <Flexbox gap={24}>
      <Alert
        message={t('protocolInstall.custom.security.description')}
        showIcon
        type="warning"
        variant={'borderless'}
      />
      <Block gap={16} horizontal justify={'space-between'} padding={16} variant={'outlined'}>
        <Flexbox gap={16} horizontal>
          <PluginAvatar avatar={schema.icon} size={40} />
          <Flexbox gap={2}>
            <Flexbox align={'center'} gap={8} horizontal>
              {schema.name}
              <PluginTag type={'customPlugin'} />
            </Flexbox>
            <Text style={{ fontSize: 12 }} type={'secondary'}>
              {schema.description}
            </Text>
          </Flexbox>
        </Flexbox>
      </Block>

      <ConfigDisplay schema={schema} />
    </Flexbox>
  );
});

// 导出配置信息
export const getCustomModalConfig = (t: any): ModalConfig => ({
  okText: t('protocolInstall.actions.installAnyway'),
  title: t('protocolInstall.custom.title'),
});

CustomPluginModal.displayName = 'CustomPluginModal';

export default CustomPluginModal;
