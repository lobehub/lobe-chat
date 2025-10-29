import { kebabCase } from 'lodash-es';
import { memo, useId, useState } from 'react';
import WebView from 'react-native-webview';

import SyntaxHighlighter from '@/components/Highlighter/SyntaxHighlighter';
import { useMermaid } from '@/components/hooks/useMermaid';

interface SyntaxMermaidProps {
  children: string;
}

const SyntaxMermaid = memo<SyntaxMermaidProps>(({ children }) => {
  const id = useId();
  const mermaidId = kebabCase(`mermaid-${id}`);
  const { data } = useMermaid(children, { id: mermaidId });
  const [imageError, setImageError] = useState(false);

  if (!data) return;

  if (imageError) return <SyntaxHighlighter language={'mermaid'}>{children}</SyntaxHighlighter>;

  return (
    <WebView
      allowsInlineMediaPlayback={true}
      automaticallyAdjustContentInsets={false}
      bounces={false}
      containerStyle={{
        padding: 16,
      }}
      domStorageEnabled={false}
      javaScriptEnabled={true}
      mediaPlaybackRequiresUserAction={false}
      onError={() => setImageError(true)}
      onHttpError={() => setImageError(true)}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      source={{ html: data }}
      style={{
        backgroundColor: 'transparent',
        height: 200,
      }}
    />
  );
});

SyntaxMermaid.displayName = 'SyntaxMermaid';

export default SyntaxMermaid;
