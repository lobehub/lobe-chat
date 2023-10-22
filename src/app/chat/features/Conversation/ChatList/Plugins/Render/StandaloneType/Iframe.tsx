import { Skeleton } from 'antd';
import { memo, useRef, useState } from 'react';

interface IFrameRenderProps {
  height?: number;
  url: string;
  width?: number;
}

const IFrameRender = memo<IFrameRenderProps>(({ url, width = 600, height = 300 }) => {
  const [loading, setLoading] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);

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
