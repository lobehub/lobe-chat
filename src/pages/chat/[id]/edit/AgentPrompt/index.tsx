import { CodeEditor, FormGroup } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Bot } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import { agentSelectors, useSessionStore } from '@/store/session';

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

  const systemRole = useSessionStore(agentSelectors.currentAgentSystemRole, shallow);

  const [updateAgentConfig] = useSessionStore((s) => [s.updateAgentConfig], shallow);

  return (
    <FormGroup icon={Bot} style={FORM_STYLE.style} title={t('settingAgent.prompt.title')}>
      <CodeEditor
        language={'md'}
        onValueChange={(e) => {
          updateAgentConfig({ systemRole: e });
        }}
        placeholder={t('settingAgent.name.placeholder')}
        resize={false}
        style={{ marginBottom: 16, marginTop: 16 }}
        type={'pure'}
        value={systemRole}
      />
    </FormGroup>
  );
});

export default AgentPrompt;
