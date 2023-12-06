import { PluginSchema } from '@lobehub/chat-plugin-sdk';
import { Form, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useToolStore } from '@/store/tool';

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
  const items = transformPluginSettings(schema);

  const { styles } = useStyles();
  const [updatePluginSettings] = useToolStore((s) => [s.updatePluginSettings]);
  const pluginSetting = useToolStore((s) => s.pluginsSettings[id] || {}, isEqual);

  return (
    <Form layout={'vertical'}>
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
