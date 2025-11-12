import { safeParseJSON } from '@lobechat/utils';
import { ActionIcon } from '@lobehub/ui';
import { Edit3Icon } from 'lucide-react';
import { Suspense, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';

import Arguments from '../Arguments';
import ApprovalActions from './ApprovalActions';
import KeyValueEditor from './KeyValueEditor';
import ModeSelector from './ModeSelector';

export type ApprovalMode = 'auto-run' | 'allow-list' | 'manual';

interface InterventionProps {
  id: string;
  requestArgs: string;
}

const Intervention = memo<InterventionProps>(({ requestArgs, id }) => {
  const { t } = useTranslation('chat');
  const approvalMode = useUserStore((s) => s.settings.tool?.approvalMode || 'manual');
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
      <Suspense fallback={<Arguments arguments={requestArgs} />}>
        <KeyValueEditor
          initialValue={safeParseJSON(requestArgs || '')}
          onCancel={handleCancel}
          onFinish={handleFinish}
        />
      </Suspense>
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
        <ModeSelector />
        <ApprovalActions approvalMode={approvalMode} />
      </Flexbox>
    </Flexbox>
  );
});

export default Intervention;
