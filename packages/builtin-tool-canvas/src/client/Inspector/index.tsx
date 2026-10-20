'use client';

import type { BuiltinInspector, BuiltinInspectorProps } from '@lobechat/types';
import { createStaticStyles, cx } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { inspectorTextStyles, shinyTextStyles } from '@/styles';

import type { CanvasApiNameType, CanvasSaveState } from '../../types';
import { CanvasApiName, CanvasIdentifier } from '../../types';

const styles = createStaticStyles(({ css, cssVar }) => ({
  chip: css`
    overflow: hidden;
    flex-shrink: 1;

    min-width: 0;
    margin-inline-start: 6px;
    padding-block: 2px;
    padding-inline: 8px;
    border-radius: 999px;

    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;

    background: ${cssVar.colorFillTertiary};
  `,
  failed: css`
    color: ${cssVar.colorError};
    background: ${cssVar.colorErrorBg};
  `,
}));

type Props = BuiltinInspectorProps<Record<string, any>, CanvasSaveState>;

const createInspector = (apiName: CanvasApiNameType) => {
  const Inspector = memo<Props>((props) => {
    const { t } = useTranslation('plugin');
    const args = { ...props.partialArgs, ...props.args };
    const issueCount = props.pluginState?.issues?.length ?? 0;
    const isSave = apiName === CanvasApiName.createCanvas || apiName === CanvasApiName.updateCanvas;
    const chip = isSave ? (props.pluginState?.title ?? args.title ?? args.canvasId) : args.canvasId;
    const busy = !!(props.isArgumentsStreaming || props.isLoading);

    return (
      <div className={inspectorTextStyles.root}>
        <span className={cx(busy && shinyTextStyles.shinyText)}>
          {t(`builtins.${CanvasIdentifier}.apiName.${apiName}`)}
        </span>
        {chip && <span className={styles.chip}>{chip}</span>}
        {issueCount > 0 && <span className={cx(styles.chip, styles.failed)}>{issueCount}</span>}
      </div>
    );
  });
  Inspector.displayName = `Canvas${apiName}Inspector`;
  return Inspector as unknown as BuiltinInspector;
};

export const CanvasInspectors: Record<string, BuiltinInspector> = Object.fromEntries(
  Object.values(CanvasApiName).map((apiName) => [apiName, createInspector(apiName)]),
);
