'use client';

import { inspectorTextStyles, shinyTextStyles } from '@lobechat/shared-tool-ui/styles';
import type { BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { AlertTriangle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { sx } from '@/styles/sx';

export interface CodexErrorArgs {
  id?: string;
  message?: string;
  type?: string;
}

const styles = stylex.create({
  icon: { flex: 'none', color: cssVar.colorWarning },
  message: {
    overflow: 'hidden',
    minWidth: '0',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Dropped while shimmering so the shiny text keeps its own colour.
  messageColor: { color: cssVar.colorWarningText },
  root: { gap: '6px', alignItems: 'center' },
});

const ErrorInspector = memo<BuiltinInspectorProps<CodexErrorArgs>>(
  ({ args, partialArgs, isArgumentsStreaming, isLoading }) => {
    const { t } = useTranslation('plugin');
    const message = args?.message?.trim() || partialArgs?.message?.trim();
    const fallback = t('builtins.codex.error.fallback', {
      defaultValue: 'Codex reported a warning',
    });

    return (
      <div {...sx([styles.root], inspectorTextStyles.root)} data-testid="codex-error-inspector">
        <Icon className={stylex.props(styles.icon).className} icon={AlertTriangle} size={14} />
        <span
          {...sx(
            [styles.message, !(isArgumentsStreaming || isLoading) && styles.messageColor],
            isArgumentsStreaming || isLoading ? shinyTextStyles.shinyText : undefined,
          )}
        >
          {message || fallback}
        </span>
      </div>
    );
  },
);

ErrorInspector.displayName = 'CodexErrorInspector';

export default ErrorInspector;
