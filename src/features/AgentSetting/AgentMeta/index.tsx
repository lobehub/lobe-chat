import { Form, type FormItemProps, Icon, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { UserCircle, Wand2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EmojiPicker from '@/components/EmojiPicker';
import { FORM_STYLE } from '@/const/layoutTokens';

import { useStore } from '../store';
import { SessionLoadingState } from '../store/initialState';
import AutoGenerateInput from './AutoGenerateInput';
import BackgroundSwatches from './BackgroundSwatches';

const AgentMeta = memo(() => {
  const { t } = useTranslation('setting');
  const [hasSystemRole, updateMeta, autocompleteMeta, autocompleteAllMeta] = useStore((s) => [
    !!s.config.systemRole,
    s.setAgentMeta,
    s.autocompleteMeta,
    s.autocompleteAllMeta,
  ]);
  const loading = useStore((s) => s.autocompleteLoading);
  const meta = useStore((s) => s.meta, isEqual);

  const basic = [
    {
      key: 'title',
      label: t('settingAgent.name.title'),
      placeholder: t('settingAgent.name.placeholder'),
    },
    {
      key: 'description',
      label: t('settingAgent.description.title'),
      placeholder: t('settingAgent.description.placeholder'),
    },
    // { key: 'tag', label: t('agentTag'), placeholder: t('agentTagPlaceholder') },
  ];

  const autocompleteItems: FormItemProps[] = basic.map((item) => {
    return {
      children: (
        <AutoGenerateInput
          loading={loading[item.key as keyof SessionLoadingState]}
          onChange={(e) => {
            updateMeta({ [item.key]: e.target.value });
          }}
          onGenerate={() => {
            autocompleteMeta(item.key as keyof typeof meta);
          }}
          placeholder={item.placeholder}
          value={meta[item.key as keyof typeof meta]}
        />
      ),
      label: item.label,
    };
  });

  const metaData: ItemGroup = useMemo(
    () => ({
      children: [
        {
          children: (
            <EmojiPicker
              avatar={meta.avatar}
              backgroundColor={meta.backgroundColor}
              onChange={(avatar) => updateMeta({ avatar })}
            />
          ),
          label: t('settingAgent.avatar.title'),
          minWidth: undefined,
        },
        {
          children: (
            <BackgroundSwatches
              backgroundColor={meta.backgroundColor}
              onChange={(backgroundColor) => updateMeta({ backgroundColor })}
            />
          ),
          divider: false,
          label: t('settingAgent.backgroundColor.title'),
          minWidth: undefined,
        },
        ...autocompleteItems,
      ],
      extra: (
        <Tooltip title={t('autoGenerateTooltip', { ns: 'common' })}>
          <Button
            disabled={!hasSystemRole}
            icon={<Icon icon={Wand2} />}
            loading={Object.values(loading).some((i) => !!i)}
            onClick={(e: any) => {
              e.stopPropagation();

              autocompleteAllMeta(true);
            }}
            size={'small'}
          >
            {t('autoGenerate', { ns: 'common' })}
          </Button>
        </Tooltip>
      ),
      icon: UserCircle,
      title: t('settingAgent.title'),
    }),
    [autocompleteItems, meta],
  );

  return <Form items={[metaData]} {...FORM_STYLE} />;
});

export default AgentMeta;
