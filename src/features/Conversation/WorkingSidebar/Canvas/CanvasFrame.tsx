import { Alert, useThemeMode } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { attachCanvasRuntime } from './runtime/host';

const styles = stylex.create({
  details: {
    color: cssVar.colorTextSecondary,
    fontFamily: cssVar.fontFamilyCode,
    fontSize: 12,
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  frame: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: '1',
    minHeight: 0,
    width: '100%',
  },
});

interface CanvasError {
  component?: string;
  message: string;
}

const MAX_ERRORS = 10;

const CanvasFrame = memo<{ src: string }>(({ src }) => {
  const { t } = useTranslation('portal');
  const ref = useRef<HTMLIFrameElement>(null);
  const { isDarkMode } = useThemeMode();
  const primaryColor = useUserStore(userGeneralSettingsSelectors.primaryColor);
  const neutralColor = useUserStore(userGeneralSettingsSelectors.neutralColor);
  const [errors, setErrors] = useState<CanvasError[]>([]);

  const theme = useMemo(
    () => ({ appearance: isDarkMode ? 'dark' : 'light', neutralColor, primaryColor }),
    [isDarkMode, neutralColor, primaryColor],
  );

  const postTheme = useCallback(() => {
    ref.current?.contentWindow?.postMessage(
      { source: 'lobe-canvas-host', theme, type: 'theme' },
      '*',
    );
  }, [theme]);

  useEffect(postTheme, [postTheme]);

  useEffect(() => setErrors([]), [src]);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    return attachCanvasRuntime(frame, (error) => {
      console.error('[lobe-canvas]', error);
      setErrors((current) => [...current, { message: String(error) }].slice(-MAX_ERRORS));
    });
  }, [src]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow || event.data?.source !== 'lobe-canvas')
        return;
      if (event.data.type === 'ready') postTheme();
      if (event.data.type === 'error') {
        setErrors((current) =>
          current.length >= MAX_ERRORS
            ? current
            : [
                ...current,
                { component: event.data.component, message: String(event.data.message) },
              ],
        );
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postTheme]);

  return (
    <>
      {errors.length > 0 && (
        <Alert
          description={t('canvas.runtimeErrorsHint')}
          title={t('canvas.runtimeErrors', { count: errors.length })}
          type={'warning'}
          extra={
            <pre {...stylex.props(styles.details)}>
              {errors
                .map((error) =>
                  error.component ? `<${error.component}> ${error.message}` : error.message,
                )
                .join('\n')}
            </pre>
          }
        />
      )}
      <iframe
        {...stylex.props(styles.frame)}
        ref={ref}
        sandbox="allow-scripts allow-popups allow-forms allow-downloads"
        src={src}
        title={t('canvas.frameTitle')}
        onLoad={postTheme}
      />
    </>
  );
});

CanvasFrame.displayName = 'CanvasFrame';

export default CanvasFrame;
