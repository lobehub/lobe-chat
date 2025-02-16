'use client';

import { EditableMessage, Form } from '@lobehub/ui';
import { Button, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';

import { useStore } from '../store';

export const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    position: relative;
    width: 100%;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorFillSecondary};
  `,
  content: css`
    z-index: 2;
    padding: 8px;
    border-radius: ${token.borderRadiusLG - 1}px;
    background: ${token.colorBgContainer};
  `,
  markdown: css`
    border: unset;
  `,
  wrapper: css`
    width: 100%;
    ${responsive.mobile} {
      padding-block: 8px;
      padding-inline: 4px;
    }
  `,
}));

const AgentPrompt = memo<{ modal?: boolean }>(({ modal }) => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const [editing, setEditing] = useState(false);
  const [loading, systemRole, updateConfig] = useStore((s) => [
    s.loading,
    s.config.systemRole,
    s.setAgentConfig,
  ]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Flexbox className={styles.container} padding={4}>
          <Flexbox horizontal justify={'space-between'} paddingBlock={8} paddingInline={12}>
            <h1 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              {t('settingAgent.prompt.title')}
            </h1>
          </Flexbox>
          <Flexbox
            align={'center'}
            className={styles.content}
            flex={1}
            gap={16}
            horizontal
            justify={'space-between'}
            padding={12}
            wrap={'wrap'}
          >
            <Skeleton active style={{ paddingTop: 12 }} title={false} />
          </Flexbox>
        </Flexbox>
      </div>
    );
  }

  const content = (
    <EditableMessage
      classNames={{
        markdown: styles.markdown,
      }}
      editButtonSize={'small'}
      editing={editing}
      height={'auto'}
      inputType={'pure'}
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
  );

  const editButton = !editing && !!systemRole && (
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
  );

  if (modal)
    return (
      <Form
        items={[
          {
            children: (
              <>
                <div style={{ height: 24 }} />
                {content}
              </>
            ),
            extra: editButton,
            title: t('settingAgent.prompt.title'),
          },
        ]}
        itemsType={'group'}
        variant={'pure'}
        {...FORM_STYLE}
      />
    );

  return (
    <div className={styles.wrapper}>
      <Flexbox className={styles.container} padding={4}>
        <Flexbox horizontal justify={'space-between'} paddingBlock={8} paddingInline={12}>
          <h1 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
            {t('settingAgent.prompt.title')}
          </h1>
          {editButton}
        </Flexbox>
        <Flexbox
          align={'center'}
          className={styles.content}
          flex={1}
          gap={16}
          horizontal
          justify={'space-between'}
          padding={12}
          wrap={'wrap'}
        >
          {content}
        </Flexbox>
      </Flexbox>
    </div>
  );
});

export default AgentPrompt;
