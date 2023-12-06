import { PluginSchema } from '@lobehub/chat-plugin-sdk';
import { Form, Markdown } from '@lobehub/ui';
import { Form as AForm } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useEffect } from 'react';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import PluginSettingRender from './PluginSettingRender';

export const transformPluginSettings = (pluginSettings: PluginSchema) => {
  if (!pluginSettings?.properties) return [];

  return Object.entries(pluginSettings.properties).map(([name, i]) => ({
    desc: i.description,
    format: i.format,
    label: i.title,
    name,
    tag: name,
    type: i.type,
  }));
};

interface PluginSettingsConfigProps {
  id: string;
  schema: PluginSchema;
}

const useStyles = createStyles(({ css, token, stylish, cx }) => ({
  markdown: cx(
    stylish.markdownInChat,
    css`
      p {
        color: ${token.colorTextDescription};
      }
    `,
  ),
}));

const PluginSettingsConfig = memo<PluginSettingsConfigProps>(({ schema, id }) => {
  const { styles } = useStyles();

  const [updatePluginSettings] = useToolStore((s) => [s.updatePluginSettings]);
  const pluginSetting = useToolStore(pluginSelectors.getPluginSettingsById(id), isEqual);

  const [form] = AForm.useForm();
  useEffect(() => {
    form.setFieldsValue(pluginSetting);
  }, []);

  const items = transformPluginSettings(schema);

  return (
    <Form form={form} layout={'vertical'}>
      {items.map((item) => (
        <Form.Item
          desc={item.desc && <Markdown className={styles.markdown}>{item.desc as string}</Markdown>}
          key={item.label}
          label={item.label}
          tag={item.tag}
        >
          <PluginSettingRender
            defaultValue={pluginSetting[item.name]}
            format={item.format}
            onChange={(value) => {
              updatePluginSettings(id, { [item.name]: value });
            }}
            type={item.type as any}
          />
        </Form.Item>
      ))}
    </Form>
  );
});

export default PluginSettingsConfig;
