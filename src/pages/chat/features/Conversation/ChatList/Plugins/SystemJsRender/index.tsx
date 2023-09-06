import { PluginRender, PluginRenderProps } from '@lobehub/chat-plugin-sdk/client';
import { Skeleton } from 'antd';
import { memo, useEffect, useState } from 'react';

import { system } from './utils';

interface SystemJsRenderProps extends PluginRenderProps {
  url: string;
}

const SystemJsRender = memo<SystemJsRenderProps>(({ url, ...props }) => {
  const [component, setComp] = useState<PluginRender | null>(null);

  useEffect(() => {
    system
      .import(url)
      .then((module1) => {
        setComp(module1.default);
        // 使用module1模块
      })
      .catch((error) => {
        setComp(null);
        console.error(error);
      });
  }, [url]);

  if (!component) {
    return <Skeleton active style={{ width: 300 }} />;
  }

  const Render = component;

  return <Render {...props} />;
});
export default SystemJsRender;
