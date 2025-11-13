import { safeParseJSON } from '@lobechat/utils';
import { Suspense, memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { toolInterventionSelectors } from '@/store/user/selectors';
import { getBuiltinIntervention } from '@/tools/interventions';

import Arguments from '../Arguments';
import ApprovalActions from './ApprovalActions';
import Fallback from './Fallback';
import KeyValueEditor from './KeyValueEditor';
import ModeSelector from './ModeSelector';

export type ApprovalMode = 'auto-run' | 'allow-list' | 'manual';

interface InterventionProps {
  apiName: string;
  id: string;
  identifier: string;
  requestArgs: string;
  toolCallId: string;
}

const Intervention = memo<InterventionProps>(
  ({ requestArgs, id, identifier, apiName, toolCallId }) => {
    const approvalMode = useUserStore(toolInterventionSelectors.approvalMode);
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
    const BuiltinToolInterventionRender = getBuiltinIntervention(identifier, apiName);

    if (BuiltinToolInterventionRender) {
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
          <BuiltinToolInterventionRender
            apiName={apiName}
            args={safeParseJSON(requestArgs || '')}
            identifier={identifier}
            messageId={id}
          />
          <Flexbox horizontal justify={'space-between'}>
            <ModeSelector />
            <ApprovalActions
              apiName={apiName}
              approvalMode={approvalMode}
              identifier={identifier}
              messageId={id}
              toolCallId={toolCallId}
            />
          </Flexbox>
        </Flexbox>
      );
    }

    return (
      <Fallback
        apiName={apiName}
        id={id}
        identifier={identifier}
        requestArgs={requestArgs}
        toolCallId={toolCallId}
      />
    );
  },
);

export default Intervention;
