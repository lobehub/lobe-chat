'use client';

import { Button, Form } from '@lobehub/ui';
import { EditableMessage } from '@lobehub/ui/chat';
import { Skeleton } from 'antd';
import { PenLineIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import Tokens from '@/features/AgentSetting/AgentPrompt/TokenTag';

import { useStore } from '../store';

const AgentPrompt = memo(() => {
  const { t } = useTranslation('setting');

  const [editing, setEditing] = useState(false);
  const [loading, systemRole, updateConfig] = useStore((s) => [
    s.loading,
    s.config.systemRole,
    s.setAgentConfig,
  ]);

  if (loading) return <Skeleton active title={false} />;

  const editButton = !editing && !!systemRole && (
    <Button
      icon={PenLineIcon}
      iconPosition={'end'}
      iconProps={{
        size: 12,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      size={'small'}
      type={'primary'}
    >
      {t('edit', { ns: 'common' })}
    </Button>
  );

  return (
    <Form
      items={[
        {
          children: (
            <>
              <EditableMessage
                editing={editing}
                height={'auto'}
                markdownProps={{
                  variant: 'chat',
                }}
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
                variant={'borderless'}
              />
              {!editing && !!systemRole && <Tokens value={systemRole} />}
            </>
          ),
          extra: editButton,
          title: t('settingAgent.prompt.title'),
        },
      ]}
      itemsType={'group'}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default AgentPrompt;
