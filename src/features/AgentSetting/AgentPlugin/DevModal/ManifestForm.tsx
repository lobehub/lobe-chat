import { Form, Input } from '@lobehub/ui';
import { FormItemProps } from '@lobehub/ui/src';
import { Radio } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginStore } from '@/store/plugin';

const ManifestForm = memo(() => {
  const { t } = useTranslation('plugin');

  const [mode, updateNewDevPlugin] = usePluginStore((s) => [
    s.newDevPlugin.manifestMode,
    s.updateNewDevPlugin,
  ]);

  const isUrl = mode === 'url';

  const configItem: FormItemProps[] = isUrl
    ? [
        {
          children: <Input placeholder={'http://localhost/manifest.json'} />,
          desc: t('dev.meta.manifest.desc'),
          label: t('dev.meta.manifest.label'),
          name: 'manifest',
          required: true,
        },
      ]
    : // TODO: 后续做成本地配置模式
      [
        {
          children: <Input placeholder={'searchEngine'} />,
          desc: t('dev.meta.identifier.desc'),
          label: t('dev.meta.identifier.label'),
          name: 'name',
          required: true,
        },

        {
          children: <Input placeholder={t('dev.meta.description.placeholder')} />,
          desc: t('dev.meta.description.desc'),
          label: t('dev.meta.description.label'),
          name: 'description',
          required: true,
        },
        {
          children: <Input placeholder={'searchEngine'} />,
          desc: t('dev.meta.identifier.desc'),
          label: t('dev.meta.identifier.label'),
          name: 'identifier',
          required: true,
        },
      ];

  return (
    <Form
      items={[
        {
          children: configItem,
          extra: (
            <Radio.Group
              onChange={(v) => {
                updateNewDevPlugin({ manifestMode: v.target.value });
              }}
              value={mode}
            >
              <Radio.Button value={'url'}>使用链接</Radio.Button>
              <Radio.Button disabled value={'local'}>
                本地配置
              </Radio.Button>
            </Radio.Group>
          ),
          title: t('dev.tabs.manifest'),
        },
      ]}
      layout={isUrl ? 'vertical' : undefined}
      onValuesChange={(e) => {
        updateNewDevPlugin(e);
      }}
    ></Form>
  );
});

export default ManifestForm;
