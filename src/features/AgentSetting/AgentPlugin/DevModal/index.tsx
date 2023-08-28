import { Icon } from '@lobehub/ui';
import { App, ConfigProvider, Modal } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { LucideBlocks } from 'lucide-react';
import { lighten } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePluginStore } from '@/store/plugin';

import ManifestForm from './ManifestForm';
import MetaForm from './MetaForm';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  content: css`
    .${prefixCls}-modal-content {
      border: 1px solid ${token.colorSplit};
      border-radius: 12px;
    }
  `,
  root: css`
    backdrop-filter: blur(5px);
  `,
}));
interface DevModalProps {
  onOpenChange: (open: boolean) => void;
  open?: boolean;
}

const DevModal = memo<DevModalProps>(({ open, onOpenChange }) => {
  const { t } = useTranslation('plugin');

  const theme = useTheme();
  const saveToList = usePluginStore((s) => s.saveToDevList);
  const { styles } = useStyles();

  const { message } = App.useApp();
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: lighten(0.005, theme.colorBgContainer),
        },
      }}
    >
      <Modal
        centered
        className={styles.content}
        closable
        maskClosable
        okText={t('dev.save')}
        onCancel={() => {
          onOpenChange(false);
        }}
        onOk={() => {
          saveToList();
          message.success(t('dev.saveSuccess'));
          onOpenChange(false);
        }}
        open={open}
        style={{ height: 750 }}
        title={
          <Flexbox gap={8} horizontal>
            <Icon icon={LucideBlocks} />
            {t('dev.title')}
          </Flexbox>
        }
        width={700}
        wrapClassName={styles.root}
      >
        <Flexbox gap={12}>
          {t('dev.modalDesc')}
          {/*<Tabs*/}
          {/*  items={[*/}
          {/*    { children: <MetaForm />, key: 'meta', label: t('dev.tabs.meta') },*/}
          {/*    { children: <ManifestForm />, key: 'manifest', label: t('dev.tabs.manifest') },*/}
          {/*  ]}*/}
          {/*/>*/}
          <MetaForm />
          <ManifestForm />
        </Flexbox>
      </Modal>
    </ConfigProvider>
  );
});

export default DevModal;
