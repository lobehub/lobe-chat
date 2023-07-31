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
  input: css`
    padding: 12px;
    background: ${token.colorFillTertiary};
    border: 1px solid ${token.colorPrimaryBorder};
    border-radius: 8px;
  `,
  markdown: css`
    padding: 12px;
    background: ${token.colorFillTertiary};
  `,
}));

export interface AgentPromptProps {
  config: LobeAgentConfig;
  updateConfig: AgentAction['updateAgentConfig'];
}

const AgentPrompt = memo<AgentPromptProps>(({ config, updateConfig }) => {
  const { t } = useTranslation('setting');

  const { systemRole, model } = config;
  const systemTokenCount = useMemo(() => encode(systemRole || '').length, [systemRole]);

  return (
    <FormGroup
      extra={
        <TokenTag displayMode={'used'} maxValue={ModelTokens[model]} value={systemTokenCount} />
      }
      icon={Bot}
      style={FORM_STYLE.style}
      title={t('settingAgent.prompt.title')}
    >
      <CodeEditor
        language={'md'}
        onValueChange={(e) => updateConfig({ systemRole: e })}
        placeholder={t('settingAgent.name.placeholder')}
        resize={false}
        style={{ marginTop: 16 }}
        type={'pure'}
        value={systemRole}
      />
    </FormGroup>
  );
});

export default AgentPrompt;
