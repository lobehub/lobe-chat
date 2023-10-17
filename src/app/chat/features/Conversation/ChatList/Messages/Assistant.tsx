import { RenderMessage } from '@lobehub/ui';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { chatSelectors } from '@/store/session/selectors';
import { isFunctionMessage } from '@/utils/message';

import FunctionCall from '../Plugins/FunctionCall';
import { DefaultMessage } from './Default';

export const AssistantMessage: RenderMessage = memo(
  ({ id, plugin, function_call, content, ...props }) => {
    const genFunctionCallProps = useSessionStore(chatSelectors.getFunctionMessageParams);

    if (!isFunctionMessage(content)) return <DefaultMessage content={content} id={id} {...props} />;

    const fcProps = genFunctionCallProps({ content, function_call, id, plugin });

    return (
      <div id={id}>
        <FunctionCall {...fcProps} />
      </div>
    );
  },
);
