import { Icon } from '@lobehub/ui';
import { GlobeOffIcon } from '@lobehub/ui/icons';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { LucideIcon, SparkleIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { SearchMode } from '@/types/search';

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
    border: 1px solid ${token.colorBorderSecondary};
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
  setLoading?: (loading: boolean) => void;
  value: SearchMode;
}

const Item = memo<NetworkOption>(({ value, description, icon, label, setLoading }) => {
  const { cx, styles } = useStyles();
  const [mode, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.agentSearchMode(s),
    s.updateAgentChatConfig,
  ]);

  return (
    <Flexbox
      align={'flex-start'}
      className={cx(styles.option, mode === value && styles.active)}
      gap={12}
      horizontal
      key={value}
      onClick={async () => {
        setLoading?.(true);
        await updateAgentChatConfig({ searchMode: value });
        setLoading?.(false);
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

interface AINetworkSettingsProps {
  setLoading?: (loading: boolean) => void;
}

const AINetworkSettings = memo<AINetworkSettingsProps>(({ setLoading }) => {
  const { t } = useTranslation('chat');
  const [model, provider] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);

  const supportFC = useAiInfraStore(aiModelSelectors.isModelSupportToolUse(model, provider));
  const isModelHasBuiltinSearchConfig = useAiInfraStore(
    aiModelSelectors.isModelHasBuiltinSearchConfig(model, provider),
  );

  const options: NetworkOption[] = [
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

  const showDivider = isModelHasBuiltinSearchConfig || !supportFC;

  return (
    <Flexbox gap={4}>
      {options.map((option) => (
        <Item setLoading={setLoading} {...option} key={option.value} />
      ))}
      {showDivider && <Divider style={{ margin: 0 }} />}
      {isModelHasBuiltinSearchConfig && <ModelBuiltinSearch />}
      {!supportFC && <FCSearchModel setLoading={setLoading} />}
    </Flexbox>
  );
});

export default AINetworkSettings;
