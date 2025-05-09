import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InfoTooltip from '@/components/InfoTooltip';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/slices/chat';

import FunctionCallingModelSelect from './FunctionCallingModelSelect';

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
    width: 200px;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};
  `,
}));

interface FCSearchModelProps {
  setLoading?: (loading: boolean) => void;
}

const FCSearchModel = memo<FCSearchModelProps>(({ setLoading }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [searchFCModel, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.searchFCModel(s),
    s.updateAgentChatConfig,
  ]);
  return (
    <Flexbox distribution={'space-between'} gap={16} horizontal padding={8}>
      <Flexbox align={'center'} gap={4} horizontal>
        <Flexbox className={styles.title}>{t('search.searchModel.title')}</Flexbox>
        <InfoTooltip title={t('search.searchModel.desc')} />
      </Flexbox>
      <FunctionCallingModelSelect
        onChange={async (value) => {
          setLoading?.(true);
          await updateAgentChatConfig({ searchFCModel: value });
          setLoading?.(false);
        }}
        style={{
          maxWidth: 160,
          width: 160,
        }}
        value={searchFCModel}
      />
    </Flexbox>
  );
});

export default FCSearchModel;
