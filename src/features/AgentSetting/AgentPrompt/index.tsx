import { EditableMessage, FormGroup } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Bot } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';

import { useStore } from '../store';
import TokenTag from './TokenTag';

export const useStyles = createStyles(({ css, token }) => ({
  markdown: css`
    border: unset;
  `,
  textarea: css`
    background: ${token.colorFillTertiary};
  `,
}));

const AgentPrompt = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const [editing, setEditing] = useState(false);
  const [systemRole, updateConfig] = useStore((s) => [s.config.systemRole, s.setAgentConfig]);

  return (
    <FormGroup
      extra={<TokenTag />}
      icon={Bot}
      style={FORM_STYLE.style}
      title={t('settingAgent.prompt.title')}
    >
      <Flexbox gap={16} paddingBlock={16}>
        <EditableMessage
          classNames={styles}
          editButtonSize={'small'}
          editing={editing}
          height={'auto'}
          inputType={'ghost'}
          onChange={(e) => {
            updateConfig({ systemRole: e });
          }}
          onEditingChange={setEditing}
          placeholder={t('settingAgent.prompt.placeholder')}
          showEditWhenEmpty
          text={{
            cancel: t('cancel', { ns: 'common' }),
            confirm: t('ok', { ns: 'common' }),
          }}
          value={systemRole}
        />
        {!editing && !!systemRole && (
          <Flexbox direction={'horizontal-reverse'}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              size={'small'}
              type={'primary'}
            >
              {t('edit', { ns: 'common' })}
            </Button>
          </Flexbox>
        )}
      </Flexbox>
    </FormGroup>
  );
});

export default AgentPrompt;
