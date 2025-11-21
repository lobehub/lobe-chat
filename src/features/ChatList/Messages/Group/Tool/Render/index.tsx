import { LOADING_FLAT } from '@lobechat/const';
import { ChatToolResult, ToolIntervention } from '@lobechat/types';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AbortResponse from './AbortResponse';
import CustomRender from './CustomRender';
import ErrorResponse from './ErrorResponse';
import Intervention from './Intervention';
import ModeSelector from './Intervention/ModeSelector';
import LoadingPlaceholder from './LoadingPlaceholder';
import RejectedResponse from './RejectedResponse';

interface RenderProps {
  apiName: string;
  arguments?: string;
  identifier: string;
  intervention?: ToolIntervention;
  /**
   * ContentBlock ID (not the group message ID)
   */
  messageId: string;
  result?: ChatToolResult;
  setShowPluginRender: (show: boolean) => void;
  showPluginRender: boolean;
  toolCallId: string;
  toolMessageId?: string;
  type?: string;
}

/**
 * Tool Render for Group Messages
 *
 * In group messages, tool results are already embedded in the payload,
 * so we don't need to query them from the store or handle streaming.
 */
const Render = memo<RenderProps>(
  ({
    toolCallId,
    messageId,
    arguments: requestArgs,
    showPluginRender,
    setShowPluginRender,
    identifier,
    apiName,
    result,
    type,
    intervention,
    toolMessageId,
  }) => {
    if (toolMessageId && intervention?.status === 'pending') {
      return (
        <Intervention
          apiName={apiName}
          id={toolMessageId}
          identifier={identifier}
          requestArgs={requestArgs || ''}
          toolCallId={toolCallId}
        />
      );
    }

    if (intervention?.status === 'rejected') {
      return <RejectedResponse reason={intervention.rejectedReason} />;
    }

    if (intervention?.status === 'aborted') {
      return <AbortResponse />;
    }

    if (!result) return null;

    // Handle error state
    if (result.error) {
      return (
        <ErrorResponse
          {...result.error}
          id={messageId}
          plugin={
            type
              ? ({
                  apiName,
                  arguments: requestArgs || '',
                  identifier,
                  type,
                } as any)
              : undefined
          }
        />
      );
    }

    const placeholder = (
      <LoadingPlaceholder
        apiName={apiName}
        identifier={identifier}
        loading
        requestArgs={requestArgs}
      />
    );

    // Standalone plugins always have LOADING_FLAT as content
    const inPlaceholder = result.content === LOADING_FLAT && type !== 'standalone';

    if (inPlaceholder) return placeholder;

    return (
      <Suspense fallback={placeholder}>
        <Flexbox gap={8}>
          <CustomRender
            content={result.content || ''}
            id={toolCallId}
            plugin={
              type
                ? ({
                    apiName,
                    arguments: requestArgs || '',
                    identifier,
                    type,
                  } as any)
                : undefined
            }
            pluginState={result.state}
            requestArgs={requestArgs}
            setShowPluginRender={setShowPluginRender}
            showPluginRender={showPluginRender}
          />
          <div>
            <ModeSelector />
          </div>
        </Flexbox>
      </Suspense>
    );
  },
);

Render.displayName = 'GroupToolRender';

export default Render;
