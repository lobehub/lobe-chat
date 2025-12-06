import { Icon } from '@lobehub/ui';
import { GlobeOffIcon } from '@lobehub/ui/icons';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { LucideIcon, SparkleIcon } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors, chatConfigByIdSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { SearchMode } from '@/types/search';

import { useAgentId } from '../../hooks/useAgentId';
import { useUpdateAgentConfig } from '../../hooks/useUpdateAgentConfig';
import FCSearchModel from './FCSearchModel';
import ModelBuiltinSearch from './ModelBuiltinSearch';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorFillTertiary};
  `,
  check: css`
    margin-inline-start: 12px;
    font-size: 16px;
    color: ${token.colorPrimary};
  `,
  description: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  icon: css`
    border: 1px solid ${token.colorFillTertiary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgElevated};
  `,
  option: css`
    cursor: pointer;

    width: 100%;
    padding-block: 8px;
    padding-inline: 8px;
    border-radius: ${token.borderRadius}px;

    transition: background-color 0.2s;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  title: css`
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};
  `,
}));

interface NetworkOption {
  description: string;
  disable?: boolean;
  icon: LucideIcon;
  label: string;
  value: SearchMode;
}

const Item = memo<NetworkOption>(({ value, description, icon, label }) => {
  const { cx, styles } = useStyles();
  const agentId = useAgentId();
  const { updateAgentChatConfig } = useUpdateAgentConfig();
  const mode = useAgentStore((s) => chatConfigByIdSelectors.getSearchModeById(agentId)(s));

  return (
    <Flexbox
      align={'flex-start'}
      className={cx(styles.option, mode === value && styles.active)}
      gap={12}
      horizontal
      key={value}
      onClick={async () => {
        await updateAgentChatConfig({ searchMode: value });
      }}
    >
      <Center className={styles.icon} flex={'none'} height={32} width={32}>
        <Icon icon={icon} />
      </Center>
      <Flexbox flex={1}>
        <div className={styles.title}>{label}</div>
        <div className={styles.description}>{description}</div>
      </Flexbox>
    </Flexbox>
  );
});

const Controls = memo(() => {
  const { t } = useTranslation('chat');
  const agentId = useAgentId();
  const { updateAgentChatConfig } = useUpdateAgentConfig();

  const [model, provider, useModelBuiltinSearch, searchMode] = useAgentStore((s) => [
    agentByIdSelectors.getAgentModelById(agentId)(s),
    agentByIdSelectors.getAgentModelProviderById(agentId)(s),
    chatConfigByIdSelectors.getUseModelBuiltinSearchById(agentId)(s),
    chatConfigByIdSelectors.getChatConfigById(agentId)(s).searchMode,
  ]);

  const supportFC = useAiInfraStore(aiModelSelectors.isModelSupportToolUse(model, provider));
  const isProviderHasBuiltinSearchConfig = useAiInfraStore(
    aiProviderSelectors.isProviderHasBuiltinSearchConfig(provider),
  );
  const isModelHasBuiltinSearchConfig = useAiInfraStore(
    aiModelSelectors.isModelHasBuiltinSearchConfig(model, provider),
  );
  const isModelBuiltinSearchInternal = useAiInfraStore(
    aiModelSelectors.isModelBuiltinSearchInternal(model, provider),
  );
  const modelBuiltinSearchImpl = useAiInfraStore(
    aiModelSelectors.modelBuiltinSearchImpl(model, provider),
  );

  useEffect(() => {
    if (isModelBuiltinSearchInternal && (searchMode ?? 'off') === 'off') {
      updateAgentChatConfig({ searchMode: 'auto' });
    }
  }, [isModelBuiltinSearchInternal, searchMode, updateAgentChatConfig]);

  const options: NetworkOption[] = isModelBuiltinSearchInternal
    ? [
        {
          description: t('search.mode.auto.desc'),
          icon: SparkleIcon,
          label: t('search.mode.auto.title'),
          value: 'auto',
        },
      ]
    : [
        {
          description: t('search.mode.off.desc'),
          icon: GlobeOffIcon,
          label: t('search.mode.off.title'),
          value: 'off',
        },
        {
          description: t('search.mode.auto.desc'),
          icon: SparkleIcon,
          label: t('search.mode.auto.title'),
          value: 'auto',
        },
      ];

  const showModelBuiltinSearch =
    !isModelBuiltinSearchInternal &&
    (isModelHasBuiltinSearchConfig || isProviderHasBuiltinSearchConfig);

  const showFCSearchModel =
    !supportFC &&
    (!modelBuiltinSearchImpl || (!isModelBuiltinSearchInternal && !useModelBuiltinSearch));

  const showDivider = showModelBuiltinSearch || showFCSearchModel;

  return (
    <Flexbox gap={4}>
      {options.map((option) => (
        <Item {...option} key={option.value} />
      ))}
      {showDivider && <Divider style={{ margin: 0 }} />}
      {showModelBuiltinSearch && <ModelBuiltinSearch />}
      {showFCSearchModel && <FCSearchModel />}
    </Flexbox>
  );
});

export default Controls;
