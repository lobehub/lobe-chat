import { LOADING_FLAT } from '@lobechat/const';
import { ChatToolResult, ToolIntervention } from '@lobechat/types';
import { Suspense, memo } from 'react';

import CustomRender from './CustomRender';
import ErrorResponse from './ErrorResponse';
import Intervention from './Intervention';
import LoadingPlaceholder from './LoadingPlaceholder';

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
      </Suspense>
    );
  },
);

Render.displayName = 'GroupToolRender';

export default Render;
