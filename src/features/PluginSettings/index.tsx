import { PluginSchema } from '@lobehub/chat-plugin-sdk';
import { Form, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { usePluginStore } from '@/store/plugin';

import PluginSettingRender from './PluginSettingRender';

export const transformPluginSettings = (pluginSettings: PluginSchema) => {
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
  settings: PluginSchema;
}

const useStyles = createStyles(({ css, token }) => ({
  md: css`
    p {
      color: ${token.colorTextDescription};
    }
  `,
}));

const PluginSettingsConfig = memo<PluginSettingsConfigProps>(({ settings, id }) => {
  const items = transformPluginSettings(settings);

  const { styles } = useStyles();
  const [updatePluginSettings] = usePluginStore((s) => [s.updatePluginSettings]);
  const pluginSetting = usePluginStore((s) => s.pluginsSettings[id] || {}, isEqual);

  return (
    <Form layout={'vertical'}>
      {items.map((item) => (
        <Form.Item
          desc={item.desc && <Markdown className={styles.md}>{item.desc as string}</Markdown>}
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
