import { ActionIcon, Avatar, Input } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { LucideSparkles } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, useSessionStore } from '@/store/session';

import { FormItem } from './FormItem';
import { useStyles } from './style';

const AgentMeta = () => {
  const { t } = useTranslation('common');

  const { styles, theme } = useStyles();

  const metaData = useSessionStore(agentSelectors.currentAgentMeta, isEqual);

  const [autocompleteMeta, loading] = useSessionStore(
    (s) => [s.autocompleteMeta, s.autocompleteLoading],
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
    <>
      <Flexbox
        align={'center'}
        distribution={'space-between'}
        horizontal
        paddingBlock={12}
        style={{
          borderBottom: `1px solid ${theme.colorBorder}`,
        }}
      >
        <Flexbox className={styles.profile}> {t('profile')}</Flexbox>
        <Button size={'large'}>{t('autoGenerate')}</Button>
      </Flexbox>
      <Flexbox gap={80} horizontal style={{ marginTop: 16 }}>
        <Flexbox flex={1} gap={24}>
          {basic.map((item) => (
            <FormItem key={item.key} label={item.label}>
              <Input
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
          <Avatar avatar={metaData.avatar} size={200} />
        </FormItem>
      </Flexbox>
    </>
  );
};

export default AgentMeta;
