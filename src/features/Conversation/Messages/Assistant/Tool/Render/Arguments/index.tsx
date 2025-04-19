import { ActionIcon, Highlighter } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { Edit3Icon, PlayCircleIcon } from 'lucide-react';
import { parse } from 'partial-json';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useYamlArguments } from '@/hooks/useYamlArguments';
import { useChatStore } from '@/store/chat';

import KeyValueEditor from './KeyValueEditor';
import ObjectEntity from './ObjectEntity';

const useStyles = createStyles(({ css, token, cx }) => ({
  button: css`
    color: ${token.colorTextSecondary};

    &:hover {
      color: ${token.colorText};
    }
  `,
  container: css`
    position: relative;

    padding-block: 4px;
    padding-inline: 12px 64px;
    border-radius: ${token.borderRadiusLG}px;

    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.5;

    background: ${token.colorFillQuaternary};

    pre {
      margin: 0 !important;
      background: none !important;
    }

    &:hover {
      .actions {
        opacity: 1;
      }
    }
  `,
  editButton: cx(
    'actions',
    css`
      position: absolute;
      z-index: 10;
      inset-block-start: 4px;
      inset-inline-end: 4px;

      opacity: 0;

      transition: opacity 0.2s ${token.motionEaseInOut};
    `,
  ),
}));

export interface ArgumentsProps {
  arguments?: string;
  messageId?: string;
  shine?: boolean;
}

const safeParseJson = (str: string): Record<string, any> => {
  try {
    const obj = parse(str);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
};

const Arguments = memo<ArgumentsProps>(({ arguments: args = '', shine, messageId }) => {
  const { styles } = useStyles();
  const { t } = useTranslation(['tool', 'common']);
  const [isEditing, setIsEditing] = useState(false);
  const { message } = App.useApp();
  const [updatePluginArguments, reInvokeToolMessage] = useChatStore((s) => [
    s.updatePluginArguments,
    s.reInvokeToolMessage,
  ]);

  const displayArgs = useMemo(() => {
    try {
      const obj = parse(args);
      if (Object.keys(obj).length === 0) return {};
      return obj;
    } catch {
      return args;
    }
  }, [args]);

  const yaml = useYamlArguments(args);

  const handleEditStart = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleFinish = useCallback(
    async (editedObject: Record<string, any>) => {
      if (!messageId) return;

      try {
        const newArgsString = JSON.stringify(editedObject, null, 2);

        if (newArgsString !== args) {
          await updatePluginArguments(messageId, editedObject, true);
          await reInvokeToolMessage(messageId);
        }
        setIsEditing(false);
      } catch (error) {
        console.error('Error stringifying arguments:', error);
        message.error(t('updateArgs.stringifyError'));
      }
    },
    [args, messageId, message],
  );

  if (isEditing) {
    return (
      <KeyValueEditor
        initialValue={safeParseJson(args)}
        onCancel={handleCancel}
        onFinish={handleFinish}
      />
    );
  }

  const showActions = !!messageId;

  if (typeof displayArgs === 'string') {
    return (
      !!yaml && (
        <div className={styles.container}>
          {showActions && (
            <ActionIcon
              className={styles.editButton}
              icon={Edit3Icon}
              onClick={handleEditStart}
              size={'small'}
              title={t('edit', { ns: 'common' })}
            />
          )}
          <Highlighter language={'yaml'} showLanguage={false}>
            {yaml}
          </Highlighter>
        </div>
      )
    );
  }

  const hasMinWidth = Object.keys(displayArgs).length > 1;

  if (Object.keys(displayArgs).length === 0) return null;

  return (
    <div className={styles.container}>
      {showActions && (
        <Flexbox className={styles.editButton} gap={4} horizontal>
          <ActionIcon
            icon={Edit3Icon}
            onClick={handleEditStart}
            size={'small'}
            title={t('edit', { ns: 'common' })}
          />
          <ActionIcon
            icon={PlayCircleIcon}
            onClick={async () => {
              await reInvokeToolMessage(messageId);
            }}
            size={'small'}
            title={t('run', { ns: 'common' })}
          />
        </Flexbox>
      )}
      {Object.entries(displayArgs).map(([key, value]) => {
        return (
          <ObjectEntity
            editable={false}
            hasMinWidth={hasMinWidth}
            key={key}
            objectKey={key}
            shine={shine}
            value={value}
          />
        );
      })}
    </div>
  );
});

export default Arguments;
