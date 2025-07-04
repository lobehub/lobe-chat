import { Form, Markdown } from '@lobehub/ui';
import { Form as AForm, Button } from 'antd';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ItemRender from '@/components/JSONSchemaConfig/ItemRender';
import { transformPluginSettings } from '@/features/PluginSettings';
import { useToolStore } from '@/store/tool';

interface MCPConfigFormProps {
  configSchema: any;
  identifier: string;
  onCancel?: () => void;
  onSubmit?: (config: Record<string, any>) => Promise<void>;
}

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    margin-block-start: ${token.marginXS}px;
    padding: ${token.padding}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    background-color: ${token.colorBgContainer};
  `,
  footer: css`
    display: flex;
    gap: ${token.marginXS}px;
    justify-content: flex-end;

    margin-block-start: ${token.margin}px;
    padding-block-start: ${token.paddingXS}px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
  markdown: css`
    p {
      color: ${token.colorTextDescription};
    }
  `,
}));

const MCPConfigForm = memo<MCPConfigFormProps>(({ configSchema, identifier, onCancel }) => {
  const { styles } = useStyles();
  const { t } = useTranslation(['plugin', 'common']);
  const [form] = AForm.useForm();
  const [loading, setLoading] = useState(false);

  const { installMCPPlugin } = useToolStore();

  const items = transformPluginSettings(configSchema);

  const handleSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      await installMCPPlugin(identifier, { config: values, resume: true });
    } catch (error) {
      console.error('Config submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // 默认行为：清理安装进度
      useToolStore.getState().updateMCPInstallProgress(identifier, undefined);
    }
  };

  return (
    <motion.div
      animate={{ y: 0 }}
      className={styles.container}
      initial={{ y: 8 }}
      transition={{ delay: 0.1, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 4 }}
        transition={{ delay: 0.15, duration: 0.2 }}
      >
        <Flexbox gap={8}>
          <strong>{t('mcpInstall.configurationRequired')}</strong>
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            {t('mcpInstall.configurationDescription')}
          </span>
        </Flexbox>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 4 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        <Form
          form={form}
          gap={12}
          items={items
            .filter((item) => configSchema.required?.includes(item.name))
            .map((item) => ({
              children: (
                <ItemRender
                  enum={item.enum}
                  format={item.format}
                  maximum={item.maximum}
                  minimum={item.minimum}
                  type={item.type as any}
                />
              ),
              desc: item.desc && (
                <Markdown className={styles.markdown} variant={'chat'}>
                  {item.desc as string}
                </Markdown>
              ),
              key: item.label,
              label: item.label,
              name: item.name,
              rules: [{ required: true }],
              tag: item.tag,
              valuePropName: item.type === 'boolean' ? 'checked' : undefined,
            }))}
          itemsType={'flat'}
          layout={'vertical'}
          onFinish={handleSubmit}
          variant={'borderless'}
        />
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={styles.footer}
        initial={{ opacity: 0, y: 4 }}
        transition={{ delay: 0.25, duration: 0.2 }}
      >
        <Button onClick={handleCancel} size="small">
          {t('common:cancel')}
        </Button>
        <Button loading={loading} onClick={() => form.submit()} size="small" type="primary">
          {t('mcpInstall.continueInstall')}
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default MCPConfigForm;
