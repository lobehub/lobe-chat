import { ChatToolResult, ToolIntervention } from '@lobechat/types';
import { AccordionItem, Flexbox, Skeleton } from '@lobehub/ui';
import { Divider } from 'antd';
import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';

import Actions from '@/features/Conversation/Messages/AssistantGroup/Tool/Actions';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import Inspectors from './Inspector';

const Debug = dynamic(() => import('./Debug'), {
  loading: () => <Skeleton.Block active height={300} width={'100%'} />,
  ssr: false,
});

const Render = dynamic(() => import('./Render'), {
  loading: () => <Skeleton.Block active height={120} width={'100%'} />,
  ssr: false,
});

export interface GroupToolProps {
  apiName: string;
  arguments?: string;
  assistantMessageId: string;
  expand?: boolean;
  handleExpand?: (expand?: boolean) => void;
  id: string;
  identifier: string;
  intervention?: ToolIntervention;
  result?: ChatToolResult;
  toolMessageId?: string;
  type?: string;
}

const Tool = memo<GroupToolProps>(
  ({
    arguments: requestArgs,
    apiName,
    assistantMessageId,
    id,
    intervention,
    identifier,
    result,
    type,
    toolMessageId,
    handleExpand,
  }) => {
    // Get renderDisplayControl from manifest
    const renderDisplayControl = useToolStore(
      toolSelectors.getRenderDisplayControl(identifier, apiName),
    );
    const [showDebug, setShowDebug] = useState(false);
    const [showPluginRender, setShowPluginRender] = useState(false);

    const isPending = intervention?.status === 'pending';
    const isReject = intervention?.status === 'rejected';
    const isAbort = intervention?.status === 'aborted';
    const needExpand = renderDisplayControl !== 'collapsed' || isPending;

    const showCustomPluginRender = !isPending && !isReject && !isAbort;

    useEffect(() => {
      if (needExpand) {
        handleExpand?.(true);
      }
    }, [needExpand]);

    return (
      <AccordionItem
        action={
          <Actions
            assistantMessageId={assistantMessageId}
            handleExpand={handleExpand}
            identifier={identifier}
            setShowDebug={setShowDebug}
            setShowPluginRender={setShowPluginRender}
            showCustomPluginRender={showCustomPluginRender}
            showDebug={showDebug}
            showPluginRender={showPluginRender}
          />
        }
        itemKey={id}
        paddingBlock={4}
        paddingInline={4}
        title={
          <Inspectors
            apiName={apiName}
            identifier={identifier}
            intervention={intervention}
            result={result}
          />
        }
      >
        <Flexbox gap={8} paddingBlock={8}>
          {showDebug && (
            <Debug
              apiName={apiName}
              identifier={identifier}
              intervention={intervention}
              requestArgs={requestArgs}
              result={result}
              toolCallId={id}
              type={type}
            />
          )}
          <Render
            apiName={apiName}
            arguments={requestArgs}
            identifier={identifier}
            intervention={intervention}
            messageId={assistantMessageId}
            result={result}
            setShowPluginRender={setShowPluginRender}
            showPluginRender={showPluginRender}
            toolCallId={id}
            toolMessageId={toolMessageId}
            type={type}
          />
          <Divider dashed style={{ marginBottom: 0, marginTop: 8 }} />
        </Flexbox>
      </AccordionItem>
    );
  },
);

Tool.displayName = 'GroupTool';

export default Tool;
