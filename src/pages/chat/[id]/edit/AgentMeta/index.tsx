import { Form, Icon, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { UserCircle, Wand2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import { agentSelectors, useSessionStore } from '@/store/session';

import AutoGenerateInput from './AutoGenerateInput';
import BackgroundSwatches from './BackgroundSwatches';
import EmojiPicker from './EmojiPicker';

const AgentMeta = memo(() => {
  const { t } = useTranslation('setting');

  const metaData = useSessionStore(agentSelectors.currentAgentMeta, isEqual);

  const [
    autocompleteMeta,
    autocompleteSessionAgentMeta,
    loading,
    updateAgentMeta,
    id,
    hasSystemRole,
  ] = useSessionStore(
    (s) => [
      s.autocompleteMeta,
      s.autocompleteSessionAgentMeta,
      s.autocompleteLoading,
      s.updateAgentMeta,
      s.activeId,
      agentSelectors.hasSystemRole(s),
    ],
    shallow,
  );

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

  const meta: ItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <EmojiPicker />,
          label: t('settingAgent.avatar.title'),
          minWidth: undefined,
        },
        {
          children: <BackgroundSwatches />,
          label: t('settingAgent.backgroundColor.title'),
          minWidth: undefined,
        },
        ...basic.map((item) => ({
          children: (
            <AutoGenerateInput
              loading={loading[item.key as keyof typeof loading]}
              onChange={(e) => {
                updateAgentMeta({ [item.key]: e.target.value });
              }}
              onGenerate={() => {
                autocompleteMeta(item.key as keyof typeof metaData);
              }}
              placeholder={item.placeholder}
              value={metaData[item.key as keyof typeof metaData]}
            />
          ),
          label: item.label,
        })),
      ],
      extra: (
        <Tooltip title={t('autoGenerateTooltip', { ns: 'common' })}>
          <Button
            disabled={!hasSystemRole}
            icon={<Icon icon={Wand2} />}
            loading={Object.values(loading).some((i) => !!i)}
            onClick={(e: any) => {
              e.stopPropagation();
              console.log(id);
              if (!id) return;
              autocompleteSessionAgentMeta(id, true);
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
    [basic, metaData],
  );

  return <Form items={[meta]} {...FORM_STYLE} />;
});

export default AgentMeta;
