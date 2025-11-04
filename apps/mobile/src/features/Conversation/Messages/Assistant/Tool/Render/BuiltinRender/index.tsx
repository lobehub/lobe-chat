import { memo } from 'react';

import WebBrowsingRender from './WebBrowsing';

export interface BuiltinRenderProps {
  apiName: string;
  arguments?: string;
  identifier: string;
  pluginState?: any;
}

/**
 * BuiltinRender - 内置工具渲染
 * 根据 identifier 分发到对应的渲染组件
 */
const BuiltinRender = memo<BuiltinRenderProps>(
  ({ identifier, apiName, arguments: args, pluginState }) => {
    // Web 搜索工具
    if (identifier === 'lobe-web-browsing') {
      return <WebBrowsingRender apiName={apiName} arguments={args} pluginState={pluginState} />;
    }

    // 其他工具暂不展示
    return null;
  },
);

BuiltinRender.displayName = 'BuiltinRender';

export default BuiltinRender;
