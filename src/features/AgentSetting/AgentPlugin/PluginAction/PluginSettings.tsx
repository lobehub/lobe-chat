import { ActionIcon, Form, Icon, ItemGroup, Markdown, Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { SettingsIcon, ToyBrick } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { transformPluginSettings } from '@/features/PluginSettings';
import PluginSettingRender from '@/features/PluginSettings/PluginSettingRender';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const useStyles = createStyles(({ css, token, cx, stylish }) => ({
  markdown: cx(
    stylish.markdownInChat,
    css`
      p {
        color: ${token.colorTextDescription};
      }
    `,
  ),
}));

const PluginSettings = memo<{ identifier: string }>(({ identifier }) => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);
  const [updatePluginSettings] = useToolStore((s) => [s.updatePluginSettings]);

  const plugin = useToolStore(pluginSelectors.getPluginManifestById(identifier));
  const pluginSettings = useToolStore(pluginSelectors.getPluginSettingsById(identifier));

  if (!plugin.settings) return null;

  const pluginsConfig = [
    {
      children: transformPluginSettings(plugin.settings).map((item) => ({
        ...item,
        children: (
          <PluginSettingRender
            defaultValue={pluginSettings?.[item.name]}
            format={item.format}
            onChange={(value) => {
              updatePluginSettings(identifier, { [item.name]: value });
            }}
            type={item.type as any}
          />
        ),
        desc: item.desc && <Markdown className={styles.markdown}>{item.desc}</Markdown>,
      })),
      title: t('plugin.settings.hint'),
    },
  ] as unknown as ItemGroup[];

  return (
    <>
      <ActionIcon
        icon={SettingsIcon}
        onClick={() => {
          setOpen(true);
        }}
        title={t('plugin.settings.tooltip')}
      />
      <Modal
        centered
        footer={false}
        onCancel={() => {
          setOpen(false);
        }}
        open={open}
        title={
          <Flexbox gap={8} horizontal>
            <Icon icon={ToyBrick} />
            {t('plugin.settings.title', { id: pluginHelpers.getPluginTitle(plugin.meta) })}
          </Flexbox>
        }
      >
        <Flexbox padding={'24px 16px 16px'}>
          <Form items={pluginsConfig} layout={'vertical'} {...FORM_STYLE} />
        </Flexbox>
      </Modal>
    </>
  );
});

export default PluginSettings;
