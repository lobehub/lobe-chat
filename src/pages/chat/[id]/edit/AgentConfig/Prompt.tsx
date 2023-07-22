import { EditableMessage } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, useSessionStore } from '@/store/session';

import { FormItem } from '../FormItem';

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

const Prompt = () => {
  const { t } = useTranslation('common');

  const [editing, setEditing] = useState(false);
  const { styles } = useStyles();

  const systemRole = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfigSafe(s);
    return config.systemRole;
  }, shallow);

  const [updateAgentConfig] = useSessionStore((s) => [s.updateAgentConfig], shallow);

  return (
    <FormItem label={t('agentPrompt')}>
      <Flexbox gap={16}>
        <EditableMessage
          classNames={styles}
          editing={editing}
          onChange={(e) => {
            updateAgentConfig({ systemRole: e });
          }}
          onEditingChange={setEditing}
          showEditWhenEmpty
          value={systemRole}
        />
        {!editing && !!systemRole && (
          <Flexbox direction={'horizontal-reverse'}>
            <Button
              onClick={() => {
                setEditing(true);
              }}
              type={'primary'}
            >
              {t('edit')}
            </Button>
          </Flexbox>
        )}
      </Flexbox>
    </FormItem>
  );
};

export default Prompt;
