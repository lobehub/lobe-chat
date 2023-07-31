import { CodeEditor, FormGroup, TokenTag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { encode } from 'gpt-tokenizer';
import { Bot } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelTokens } from '@/const/modelTokens';
import { AgentAction } from '@/store/session/slices/agentConfig';
import { LobeAgentConfig } from '@/types/session';

export const useStyles = createStyles(({ css, token }) => ({
  token: css`
    padding-left: 8px;
    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusSM}px;
  `,
}));

export interface AgentPromptProps {
  config: LobeAgentConfig;
  updateConfig: AgentAction['updateAgentConfig'];
}

const AgentPrompt = memo<AgentPromptProps>(({ config, updateConfig }) => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const { systemRole, model } = config;
  const systemTokenCount = useMemo(() => encode(systemRole || '').length, [systemRole]);

  return (
    <FormGroup
      extra={
        <TokenTag
          className={styles.token}
          displayMode={'used'}
          maxValue={ModelTokens[model]}
          text={{
            overload: t('tokenTag.overload', { ns: 'common' }),
            remained: t('tokenTag.remained', { ns: 'common' }),
            used: t('tokenTag.used', { ns: 'common' }),
          }}
          value={systemTokenCount}
        />
      }
      icon={Bot}
      style={FORM_STYLE.style}
      title={t('settingAgent.prompt.title')}
    >
      <CodeEditor
        language={'md'}
        onValueChange={(e) => updateConfig({ systemRole: e })}
        placeholder={t('settingAgent.prompt.placeholder')}
        resize={false}
        style={{ padding: '16px 0' }}
        type={'pure'}
        value={systemRole}
      />
    </FormGroup>
  );
});

export default AgentPrompt;
