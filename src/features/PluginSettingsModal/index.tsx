import { Avatar, Modal } from '@lobehub/ui';
import { Divider, Typography } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import PluginSettingsConfig from '@/features/PluginSettings';
import { pluginHelpers, pluginSelectors, usePluginStore } from '@/store/plugin';

interface PluginSettingsModalProps {
  id: string;
  onClose: () => void;
  open?: boolean;
  schema: any;
}

const PluginSettingsModal = memo<PluginSettingsModalProps>(({ schema, onClose, id, open }) => {
  const pluginMeta = usePluginStore(pluginSelectors.getPluginMetaById(id), isEqual);

  const { t } = useTranslation('plugin');
  const theme = useTheme();
  return (
    <Modal onCancel={onClose} open={open} title={t('setting')} width={600}>
      <Center gap={16}>
        <Avatar
          avatar={pluginHelpers.getPluginAvatar(pluginMeta?.meta) || '⚙️'}
          background={theme.colorFillContent}
          gap={12}
          size={64}
        />

        <Flexbox style={{ fontSize: 20 }}>{pluginHelpers.getPluginTitle(pluginMeta?.meta)}</Flexbox>
        <Typography.Text type={'secondary'}>
          {pluginHelpers.getPluginDesc(pluginMeta?.meta)}
        </Typography.Text>
        <Divider style={{ marginBottom: 0, marginTop: 8 }} />
        {schema && <PluginSettingsConfig id={id} schema={schema} />}
      </Center>
    </Modal>
  );
});

export default PluginSettingsModal;
