import { LobeChatPluginManifest, pluginManifestSchema } from '@lobehub/chat-plugin-sdk';
import { ActionIcon, Form, FormItemProps, Input, Tooltip } from '@lobehub/ui';
import { FormInstance, Radio } from 'antd';
import { FileCode, RotateCwIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';

const ManifestForm = memo<{ form: FormInstance; mode?: 'url' | 'local' }>(
  ({ form, mode = 'url' }) => {
    const { t } = useTranslation('plugin');

    const [manifest, setManifest] = useState<LobeChatPluginManifest>();

    const isUrl = mode === 'url';

    const configItem: FormItemProps[] = isUrl
      ? [
          {
            children: (
              <Input
                placeholder={'http://localhost:3400/manifest-dev.json'}
                suffix={
                  <ActionIcon
                    icon={RotateCwIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      form.validateFields(['manifest']);
                    }}
                    size={'small'}
                    title={t('dev.meta.manifest.refresh')}
                  />
                }
              />
            ),
            extra: (
              <Flexbox horizontal justify={'space-between'} style={{ marginTop: 8 }}>
                {t('dev.meta.manifest.desc')}
                {manifest && (
                  <ManifestPreviewer manifest={manifest}>
                    <ActionIcon
                      icon={FileCode}
                      size={'small'}
                      title={t('dev.meta.manifest.preview')}
                    />
                  </ManifestPreviewer>
                )}
              </Flexbox>
            ),
            // extra: <div>123</div>,
            hasFeedback: true,
            label: t('dev.meta.manifest.label'),
            name: 'manifest',
            required: true,
            rules: [
              { required: true },
              {
                message: t('dev.meta.manifest.urlError'),
                pattern: /^https?:\/\/.*/,
              },
              {
                // message: t('dev.meta.manifest.invalid'),
                validator: async (_, value) => {
                  if (!value) return true;

                  let res: Response;

                  try {
                    res = await fetch(value);
                  } catch {
                    throw t('dev.meta.manifest.requestError');
                  }

                  const json = await res.json().catch(() => {
                    throw t('dev.meta.manifest.urlError');
                  });

                  const valid = pluginManifestSchema.safeParse(json);
                  if (!valid.success) {
                    throw t('dev.meta.manifest.jsonInvalid', { error: valid.error });
                  }

                  setManifest(json);
                  form.setFieldValue('identifier', valid.data.identifier);
                },
              },
            ],
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
        form={form}
        items={[
          {
            children: configItem,
            extra: (
              <Radio.Group
                onChange={(v) => {
                  form.setFieldValue('manifestMode', v.target.value);
                }}
                size={'small'}
                value={mode}
              >
                <Radio.Button value={'url'}>{t('dev.manifest.mode.url')}</Radio.Button>
                <Tooltip title={t('dev.manifest.mode.local-tooltip')}>
                  <Radio.Button disabled value={'local'}>
                    {t('dev.manifest.mode.local')}
                  </Radio.Button>
                </Tooltip>
              </Radio.Group>
            ),
            title: t('dev.tabs.manifest'),
          },
        ]}
        layout={isUrl ? 'vertical' : undefined}
      />
    );
  },
);

export default ManifestForm;
