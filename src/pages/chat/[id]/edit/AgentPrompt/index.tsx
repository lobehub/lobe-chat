import { CodeEditor, FormGroup, TokenTag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Bot } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelTokens } from '@/const/modelTokens';
import { agentSelectors, chatSelectors, useSessionStore } from '@/store/session';

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

const AgentPrompt = memo(() => {
  const { t } = useTranslation('setting');

  const [systemRole, model, systemTokenCount, updateAgentConfig] = useSessionStore(
    (s) => [
      agentSelectors.currentAgentSystemRole(s),
      agentSelectors.currentAgentModel(s),
      chatSelectors.systemRoleTokenCount(s),
      s.updateAgentConfig,
    ],
    shallow,
  );

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
        onValueChange={(e) => {
          updateAgentConfig({ systemRole: e });
        }}
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
