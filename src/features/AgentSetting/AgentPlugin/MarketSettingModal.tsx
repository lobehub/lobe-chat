import { Icon, Input, Tooltip } from '@lobehub/ui';
import { ConfigProvider, Form, Modal } from 'antd';
import { createStyles } from 'antd-style';
import { LucideSettings } from 'lucide-react';
import { lighten } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PLUGINS_INDEX_URL } from '@/const/url';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  content: css`
    .${prefixCls}-modal-content {
      border: 1px solid ${token.colorSplit};
      border-radius: 12px;
    }
  `,
  root: css`
    backdrop-filter: blur(2px);
  `,
}));

interface MarketSettingModalProps {
  onOpenChange: (open: boolean) => void;
  open?: boolean;
}

const MarketSettingModal = memo<MarketSettingModalProps>(({ open, onOpenChange }) => {
  const { t } = useTranslation('plugin');
  const { styles, theme } = useStyles();

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
        closable
        maskClosable
        onCancel={() => {
          onOpenChange(false);
        }}
        open={open}
        title={
          <Flexbox gap={8} horizontal style={{ marginBottom: 24 }}>
            <Icon icon={LucideSettings} />
            {t('settings.title')}
          </Flexbox>
        }
        width={700}
        wrapClassName={styles.root}
      >
        <Flexbox gap={12}>
          <Form layout={'vertical'}>
            <Form.Item extra={t('settings.modalDesc')} label={t('settings.indexUrl.title')}>
              <Tooltip title={t('settings.indexUrl.tooltip')}>
                <Input
                  defaultValue={PLUGINS_INDEX_URL}
                  disabled
                  placeholder={'https://xxxxx.com/index.json'}
                />
              </Tooltip>
            </Form.Item>
          </Form>
        </Flexbox>
      </Modal>
    </ConfigProvider>
  );
});

export default MarketSettingModal;
