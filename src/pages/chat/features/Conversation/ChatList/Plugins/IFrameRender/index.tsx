import { PluginRenderProps } from '@lobehub/chat-plugin-sdk/client';
import { Skeleton } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';

import { useOnPluginFetchMessage, useOnPluginReady } from './hooks';
import { sendMessageToPlugin } from './utils';

interface IFrameRenderProps extends PluginRenderProps {
  height?: number;
  url: string;
  width?: number;
}

const IFrameRender = memo<IFrameRenderProps>(({ url, width = 800, height = 300, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [readyForRender, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useOnPluginReady(() => setReady(true));

  // 当 props 发生变化时，主动向 iframe 发送数据
  useEffect(() => {
    const iframeWin = iframeRef.current?.contentWindow;

    if (iframeWin && readyForRender) {
      sendMessageToPlugin(iframeWin, props);
    }
  }, [readyForRender, props]);

  // 当接收到来自 iframe 的请求时，触发发送数据
  useOnPluginFetchMessage(() => {
    const iframeWin = iframeRef.current?.contentWindow;
    if (iframeWin) {
      sendMessageToPlugin(iframeWin, props);
    }
  }, [props]);

  return (
    <>
      {loading && <Skeleton active style={{ width }} />}
      <iframe
        // @ts-ignore
        allowtransparency="true"
        height={height}
        hidden={loading}
        onLoad={() => {
          setLoading(false);
        }}
        ref={iframeRef}
        src={url}
        style={{
          border: 0,
          // iframe 在 color-scheme:dark 模式下无法透明
          // refs: https://www.jianshu.com/p/bc5a37bb6a7b
          colorScheme: 'light',
        }}
        width={width}
      />
    </>
  );
});
export default IFrameRender;
