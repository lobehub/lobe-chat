import { RenderMessage } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { chatSelectors } from '@/store/session/selectors';

import FunctionCall from '../Plugins/FunctionCall';
import PluginMessage from '../Plugins/PluginMessage';

export const FunctionMessage: RenderMessage = memo(
  ({ id, content, plugin, function_call, name }) => {
    const genFunctionCallProps = useSessionStore(chatSelectors.getFunctionMessageParams);
    const fcProps = genFunctionCallProps({ content, function_call, id, plugin });

    return (
      <Flexbox gap={12} id={id}>
        <FunctionCall {...fcProps} />
        <PluginMessage content={content} loading={fcProps.loading} name={name} />
      </Flexbox>
    );
  },
);
