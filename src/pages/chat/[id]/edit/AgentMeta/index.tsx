import { ActionIcon, Input, Tooltip } from '@lobehub/ui';
import { Button, Collapse } from 'antd';
import isEqual from 'fast-deep-equal';
import { LucideSparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, useSessionStore } from '@/store/session';

import { FormItem } from '../FormItem';
import { useStyles } from '../style';
import EmojiPicker from './EmojiPicker';

const AgentMeta = () => {
  const { t } = useTranslation('common');

  const { styles, theme } = useStyles();

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
    { key: 'title', label: t('agentName'), placeholder: t('agentNamePlaceholder') },
    {
      key: 'description',
      label: t('agentDescription'),
      placeholder: t('agentDescriptionPlaceholder'),
    },
    // { key: 'tag', label: t('agentTag'), placeholder: t('agentTagPlaceholder') },
  ];

  return (
    <Collapse
      defaultActiveKey={hasSystemRole ? ['meta'] : []}
      items={[
        {
          children: (
            <Flexbox gap={80} horizontal style={{ marginTop: 16 }}>
              <Flexbox flex={1} gap={24}>
                {basic.map((item) => (
                  <FormItem key={item.key} label={item.label}>
                    <Input
                      onChange={(e) => {
                        updateAgentMeta({ [item.key]: e.target.value });
                      }}
                      placeholder={item.placeholder}
                      suffix={
                        <ActionIcon
                          icon={LucideSparkles}
                          loading={loading[item.key as keyof typeof loading]}
                          onClick={() => {
                            autocompleteMeta(item.key as keyof typeof metaData);
                          }}
                          size={'small'}
                          style={{
                            color: theme.purple,
                          }}
                          title={t('autoGenerate')}
                        />
                      }
                      type={'block'}
                      value={metaData[item.key as keyof typeof metaData]}
                    />
                  </FormItem>
                ))}
              </Flexbox>
              <FormItem label={t('agentAvatar')}>
                <EmojiPicker />
              </FormItem>
            </Flexbox>
          ),
          className: styles.collapseHeader,
          extra: (
            <Tooltip title={t('autoGenerateTooltip')}>
              <Button
                disabled={!hasSystemRole}
                loading={Object.values(loading).some((i) => !!i)}
                onClick={(e: any) => {
                  e.stopPropagation();
                  console.log(id);
                  if (!id) return;

                  autocompleteSessionAgentMeta(id, true);
                }}
                size={'large'}
              >
                {t('autoGenerate')}
              </Button>
            </Tooltip>
          ),
          key: 'meta',
          label: <Flexbox className={styles.profile}>{t('profile')}</Flexbox>,
        },
      ]}
    />
  );
};

export default AgentMeta;
