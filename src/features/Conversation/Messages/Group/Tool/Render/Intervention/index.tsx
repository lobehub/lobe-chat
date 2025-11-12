import { safeParseJSON } from '@lobechat/utils';
import { ActionIcon, Button } from '@lobehub/ui';
import { Checkbox } from 'antd';
import { createStyles } from 'antd-style';
import { Edit3Icon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

import Arguments from '../Arguments';
import KeyValueEditor from './KeyValueEditor';

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    gap: ${token.marginSM}px;
  `,
  checkbox: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};

    .ant-checkbox {
      margin-inline-end: ${token.marginXS}px;
    }
  `,
}));

interface InterventionProps {
  id: string;
  onApprove?: (remember: boolean) => void;
  onReject?: (remember: boolean) => void;
  requestArgs: string;
}

const Intervention = memo<InterventionProps>(({ requestArgs, onApprove, onReject, id }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [remember, setRemember] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [optimisticUpdatePluginArguments] = useChatStore((s) => [
    s.optimisticUpdatePluginArguments,
  ]);
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleFinish = useCallback(
    async (editedObject: Record<string, any>) => {
      if (!id) return;

      try {
        const newArgsString = JSON.stringify(editedObject, null, 2);

        if (newArgsString !== requestArgs) {
          await optimisticUpdatePluginArguments(id, editedObject, true);
        }
        setIsEditing(false);
      } catch (error) {
        console.error('Error stringifying arguments:', error);
      }
    },
    [requestArgs, id],
  );

  if (isEditing)
    return (
      <KeyValueEditor
        initialValue={safeParseJSON(requestArgs || '')}
        onCancel={handleCancel}
        onFinish={handleFinish}
      />
    );

  return (
    <Flexbox gap={12}>
      <Arguments
        actions={
          <ActionIcon
            icon={Edit3Icon}
            onClick={() => {
              setIsEditing(true);
            }}
            size={'small'}
            title={t('edit', { ns: 'common' })}
          />
        }
        arguments={requestArgs}
      />

      <Flexbox horizontal justify={'space-between'}>
        <Checkbox
          checked={remember}
          className={styles.checkbox}
          onChange={(e) => setRemember(e.target.checked)}
        >
          {t('tool.intervention.rememberDecision', { ns: 'chat' })}
        </Checkbox>
        <Flexbox className={styles.actions} gap={8} horizontal>
          <Button onClick={() => onReject?.(remember)} size="small" type="default">
            {t('tool.intervention.reject', { ns: 'chat' })}
          </Button>
          <Button onClick={() => onApprove?.(remember)} size="small" type="primary">
            {t('tool.intervention.approve', { ns: 'chat' })}
          </Button>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default Intervention;
