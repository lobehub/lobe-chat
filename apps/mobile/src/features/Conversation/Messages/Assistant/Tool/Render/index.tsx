import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import BuiltinRender from './BuiltinRender';

export interface ToolRenderProps {
  apiName: string;
  arguments?: string;
  identifier: string;
  pluginState?: any;
}

/**
 * ToolRender - 工具渲染主组件
 * 简化版，只支持内置工具渲染
 */
const ToolRender = memo<ToolRenderProps>(
  ({ identifier, apiName, arguments: args, pluginState }) => {
    return (
      <Flexbox gap={8}>
        <BuiltinRender
          apiName={apiName}
          arguments={args}
          identifier={identifier}
          pluginState={pluginState}
        />
      </Flexbox>
    );
  },
);

ToolRender.displayName = 'ToolRender';

export default ToolRender;
