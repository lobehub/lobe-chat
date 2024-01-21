import { Modal, TabsNav } from '@lobehub/ui';
import { Divider, TabsProps } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

import PluginSettingsConfig from '@/features/PluginSettings';
import { pluginHelpers } from '@/store/tool';

import APIs from './APIs';
import Meta from './Meta';

interface PluginDetailModalProps {
  id: string;
  onClose: () => void;
  onTabChange?: (key: string) => void;
  open?: boolean;
  schema: any;
  tab?: string;
}

const PluginDetailModal = memo<PluginDetailModalProps>(
  ({ schema, onClose, id, onTabChange, open, tab }) => {
    const [tabKey, setTabKey] = useMergeState('info', {
      onChange: onTabChange,
      value: tab,
    });
    const { t } = useTranslation('plugin');

    const hasSettings = pluginHelpers.isSettingSchemaNonEmpty(schema);

    return (
      <Modal
        allowFullscreen
        onCancel={onClose}
        onOk={() => {
          onClose();
        }}
        open={open}
        title={t('detailModal.title')}
        width={650}
      >
        <Center gap={8}>
          <Meta id={id} />
          <Divider style={{ marginBottom: 0, marginTop: 8 }} />
          <TabsNav
            activeKey={tabKey}
            items={
              [
                {
                  key: 'info',
                  label: t('detailModal.tabs.info'),
                },
                hasSettings && {
                  key: 'settings',
                  label: t('detailModal.tabs.settings'),
                },
              ].filter(Boolean) as TabsProps['items']
            }
            onChange={setTabKey}
            variant={'compact'}
          />
          {tabKey === 'settings' ? (
            hasSettings && <PluginSettingsConfig id={id} schema={schema} />
          ) : (
            <APIs id={id} />
          )}
        </Center>
      </Modal>
    );
  },
);

export default PluginDetailModal;
