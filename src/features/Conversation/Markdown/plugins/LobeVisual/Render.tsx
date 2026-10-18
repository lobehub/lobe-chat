import { Highlighter, HtmlPreviewIframe, Skeleton, useTheme } from '@lobehub/ui';
import { type ReactNode, useMemo } from 'react';

import { useIsDark } from '@/hooks/useIsDark';
import { useChatStore } from '@/store/chat';
import { messageStateSelectors } from '@/store/chat/selectors';

import { type MarkdownElementProps } from '../type';
import { buildVisualDocument, type VisualPalette } from './buildDocument';
import { parseVisual } from './schema';

const toText = (children: ReactNode): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(toText).join('');
  return '';
};

const Render = ({ children, id }: MarkdownElementProps) => {
  const theme = useTheme();
  const isDark = useIsDark();
  const isGenerating = useChatStore(messageStateSelectors.isMessageGenerating(id));

  const source = toText(children).trim();
  const parsed = useMemo(() => parseVisual(source), [source]);

  // Rebuilt only when the theme changes, so the iframe document is not
  // regenerated on every streaming tick.
  const palette = useMemo<VisualPalette>(
    () => ({
      border: theme.colorBorderSecondary,
      colorScheme: isDark ? 'dark' : 'light',
      error: theme.colorError,
      fill: theme.colorFillQuaternary,
      fontFamily: theme.fontFamily,
      primary: theme.colorPrimary,
      success: theme.colorSuccess,
      text: theme.colorText,
      textSecondary: theme.colorTextSecondary,
      textTertiary: theme.colorTextTertiary,
      warning: theme.colorWarning,
    }),
    [theme, isDark],
  );

  const document = useMemo(
    () => (parsed.success ? buildVisualDocument(parsed.blocks, palette) : null),
    [parsed, palette],
  );

  if (!document) {
    // A partial fence body is expected while streaming; a broken one afterwards
    // still shows its source so nothing the model wrote disappears.
    if (isGenerating) return <Skeleton height={72} radius={10} />;
    return (
      <Highlighter language={'json'} variant={'filled'}>
        {source}
      </Highlighter>
    );
  }

  return (
    <HtmlPreviewIframe
      background={'transparent'}
      content={document}
      defaultHeight={48}
      style={{ colorScheme: palette.colorScheme, marginBlock: 8 }}
      title={'visual'}
    />
  );
};

export default Render;
