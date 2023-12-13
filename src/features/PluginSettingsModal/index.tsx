import { Avatar, Modal } from '@lobehub/ui';
import { Divider, Typography } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import PluginSettingsConfig from '@/features/PluginSettings';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

interface PluginSettingsModalProps {
  id: string;
  onClose: () => void;
  open?: boolean;
  schema: any;
}

const PluginSettingsModal = memo<PluginSettingsModalProps>(({ schema, onClose, id, open }) => {
  const pluginMeta = useToolStore(pluginSelectors.getPluginMetaById(id), isEqual);

  const { t } = useTranslation('plugin');
  const theme = useTheme();
  return (
    <Modal
      cancelText={t('cancel', { ns: 'common' })}
      okText={t('ok', { ns: 'common' })}
      onCancel={onClose}
      onOk={() => {
        onClose();
      }}
      open={open}
      title={t('setting')}
      width={600}
    >
      <MobilePadding>
        <Center gap={16}>
          <Avatar
            avatar={pluginHelpers.getPluginAvatar(pluginMeta) || '⚙️'}
            background={theme.colorFillContent}
            gap={12}
            size={64}
          />

          <Flexbox style={{ fontSize: 20 }}>{pluginHelpers.getPluginTitle(pluginMeta)}</Flexbox>
          <Typography.Text type={'secondary'}>
            {pluginHelpers.getPluginDesc(pluginMeta)}
          </Typography.Text>
          <Divider style={{ marginBottom: 0, marginTop: 8 }} />
          {schema && <PluginSettingsConfig id={id} schema={schema} />}
        </Center>
      </MobilePadding>
    </Modal>
  );
});

export default PluginSettingsModal;
