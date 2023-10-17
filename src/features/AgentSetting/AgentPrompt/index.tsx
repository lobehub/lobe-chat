import { EditableMessage, FormGroup, TokenTag } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Bot } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelTokens } from '@/const/modelTokens';
import { useTokenCount } from '@/hooks/useTokenCount';
import { LanguageModel } from '@/types/llm';

import { useStore } from '../store';

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
  const updateConfig = useStore((s) => s.setAgentConfig);
  const [systemRole, model] = useStore((s) => [s.config.systemRole, s.config.model]);
  const systemTokenCount = useTokenCount(systemRole);

  const showTag = model in ModelTokens;

  return (
    <FormGroup
      extra={
        <Flexbox align={'center'} gap={8} horizontal>
          {showTag && (
            <TokenTag
              displayMode={'used'}
              maxValue={ModelTokens[model as LanguageModel]}
              shape={'square'}
              text={{
                overload: t('tokenTag.overload', { ns: 'chat' }),
                remained: t('tokenTag.remained', { ns: 'chat' }),
                used: t('tokenTag.used', { ns: 'chat' }),
              }}
              value={systemTokenCount}
            />
          )}
        </Flexbox>
      }
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
