import { DisconnectOutlined } from '@ant-design/icons';
import { Icon } from '@lobehub/ui';
import { Divider, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { CheckIcon, SparklesIcon } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { SearchMode } from '@/types/search';

import FCSearchModel from './FCSearchModel';
import ModelBuiltinSearch from './ModelBuiltinSearch';

const { Text } = Typography;

interface NetworkOption {
  description: string;
  disable?: boolean;
  icon: ReactNode;
  label: string;
  value: SearchMode;
}

const useStyles = createStyles(({ css, token }) => ({
  check: css`
    margin-inline-start: 12px;
    font-size: 16px;
    color: ${token.colorPrimary};
  `,
  content: css`
    flex: 1;
    width: 230px;
  `,
  description: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  iconWrapper: css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;
    border-radius: 8px;

    font-size: 16px;

    background: ${token.colorFillQuaternary};
  `,
  option: css`
    cursor: pointer;

    align-items: center;

    width: 100%;
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: 8px;

    transition: background-color 0.2s;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  title: css`
    margin-block-end: 2px;
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};
  `,
}));

const Item = memo<NetworkOption>(({ value, description, icon, label }) => {
  const { styles } = useStyles();
  const [mode, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.agentSearchMode(s),
    s.updateAgentChatConfig,
  ]);

  return (
    <Flexbox
      className={styles.option}
      gap={24}
      horizontal
      key={value}
      onClick={() => updateAgentChatConfig({ searchMode: value })}
    >
      <Flexbox gap={8} horizontal>
        <div className={styles.iconWrapper}>{icon}</div>
        <div className={styles.content}>
          <div className={styles.title}>{label}</div>
          <Text className={styles.description} type="secondary">
            {description}
          </Text>
        </div>
      </Flexbox>
      {mode === value && <Icon className={styles.check} icon={CheckIcon} />}
    </Flexbox>
  );
});

interface AINetworkSettingsProps {
  providerSearch?: boolean;
}
const AINetworkSettings = memo<AINetworkSettingsProps>(() => {
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
      icon: <DisconnectOutlined />,
      label: t('search.mode.off.title'),
      value: 'off',
    },
    {
      description: t('search.mode.auto.desc'),
      icon: <Icon icon={SparklesIcon} />,
      label: t('search.mode.auto.title'),
      value: 'auto',
    },
  ];

  const showDivider = isModelHasBuiltinSearchConfig || !supportFC;

  return (
    <Flexbox gap={8}>
      {options.map((option) => (
        <Item {...option} key={option.value} />
      ))}
      {showDivider && <Divider style={{ margin: 0, paddingInline: 12 }} />}
      {isModelHasBuiltinSearchConfig && <ModelBuiltinSearch />}
      {!supportFC && <FCSearchModel />}
    </Flexbox>
  );
});

export default AINetworkSettings;
