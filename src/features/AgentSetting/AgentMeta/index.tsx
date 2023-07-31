import { Form, type FormItemProps, Icon, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { UserCircle, Wand2 } from 'lucide-react';
import { ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EmojiPicker from '@/components/EmojiPicker';
import { FORM_STYLE } from '@/const/layoutTokens';
import { AgentAction, SessionLoadingState } from '@/store/session/slices/agentConfig';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';

import AutoGenerateInput from './AutoGenerateInput';
import BackgroundSwatches from './BackgroundSwatches';

export interface Autocomplete {
  autocompleteMeta: AgentAction['autocompleteMeta'];
  autocompleteSessionAgentMeta: AgentAction['autocompleteSessionAgentMeta'];
  id: string | null;
  loading: SessionLoadingState;
}

export interface AgentMetaProps {
  autocomplete?: Autocomplete;
  config: LobeAgentConfig;
  meta: MetaData;
  updateMeta: AgentAction['updateAgentMeta'];
}

const AgentMeta = memo<AgentMetaProps>(({ config, meta, updateMeta, autocomplete }) => {
  const { t } = useTranslation('setting');

  const hasSystemRole = useMemo(() => !!config.systemRole, [config]);

  let extra: ReactNode | undefined;

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
    const handleGenerate = () => autocomplete?.autocompleteMeta(item.key as keyof typeof meta);
    return {
      children: (
        <AutoGenerateInput
          loading={autocomplete?.loading[item.key as keyof SessionLoadingState]}
          onChange={(e) => {
            updateMeta({ [item.key]: e.target.value });
          }}
          onGenerate={autocomplete ? handleGenerate : undefined}
          placeholder={item.placeholder}
          value={meta[item.key as keyof typeof meta]}
        />
      ),
      label: item.label,
    };
  });

  if (autocomplete) {
    const { autocompleteSessionAgentMeta, loading, id } = autocomplete;

    extra = (
      <Tooltip title={t('autoGenerateTooltip', { ns: 'common' })}>
        <Button
          disabled={!hasSystemRole}
          icon={<Icon icon={Wand2} />}
          loading={Object.values(loading).some((i) => !!i)}
          onClick={(e: any) => {
            e.stopPropagation();
            if (!id) return;
            autocompleteSessionAgentMeta(id, true);
          }}
          size={'small'}
        >
          {t('autoGenerate', { ns: 'common' })}
        </Button>
      </Tooltip>
    );
  }

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
          label: t('settingAgent.backgroundColor.title'),
          minWidth: undefined,
        },
        ...autocompleteItems,
      ],
      extra: extra,
      icon: UserCircle,
      title: t('settingAgent.title'),
    }),
    [autocompleteItems, extra, meta],
  );

  return <Form items={[metaData]} {...FORM_STYLE} />;
});

export default AgentMeta;
