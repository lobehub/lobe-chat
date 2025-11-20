import { ToolIntervention } from '@lobechat/types';
import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LayoutPanelTop, LogsIcon, LucideBug, LucideBugOff, Trash2 } from 'lucide-react';
import { CSSProperties, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { dbMessageSelectors } from '@/store/chat/slices/message/selectors';
import { shinyTextStylish } from '@/styles/loading';

import Debug from './Debug';
import Settings from './Settings';
import StatusIndicator from './StatusIndicator';
import ToolTitle from './ToolTitle';

export const useStyles = createStyles(({ css, token, cx }) => ({
  actions: cx(
    'inspector-container',
    css`
      opacity: 0;
      transition: opacity 300ms ease-in-out;
    `,
  ),
  apiName: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    text-overflow: ellipsis;
  `,
  container: css`
    :hover {
      .inspector-container {
        opacity: 1;
      }
    }
  `,
  plugin: css`
    display: flex;
    gap: 4px;
    align-items: center;
    width: fit-content;
  `,
  shinyText: shinyTextStylish(token),
  tool: css`
    cursor: pointer;

    width: fit-content;
    padding-block: 2px;
    border-radius: 6px;

    color: ${token.colorTextTertiary};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
}));

interface InspectorProps {
  apiName: string;
  arguments?: string;
  assistantMessageId: string;
  hidePluginUI?: boolean;
  id: string;
  identifier: string;
  index: number;
  intervention?: ToolIntervention;
  result?: { content: string | null; error?: any; state?: any };
  setShowPluginRender: (show: boolean) => void;
  setShowRender: (show: boolean) => void;
  showPluginRender: boolean;
  showPortal?: boolean;
  showRender: boolean;
  style?: CSSProperties;
  toolMessageId?: string;
  type?: string;
}

const Inspectors = memo<InspectorProps>(
  ({
    assistantMessageId,
    index,
    identifier,
    apiName,
    id,
    arguments: requestArgs,
    result,
    setShowRender,
    showPluginRender,
    setShowPluginRender,
    type,
    intervention,
    toolMessageId,
  }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();

    const [showDebug, setShowDebug] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [deleteAssistantMessage, toggleInspectExpanded] = useChatStore((s) => [
      s.deleteAssistantMessage,
      s.toggleInspectExpanded,
    ]);

    const hasError = !!result?.error;
    const hasSuccessResult = !!result?.content && result.content !== LOADING_FLAT;

    const hasResult = hasSuccessResult || hasError;

    const isPending = intervention?.status === 'pending';
    const isReject = intervention?.status === 'rejected';
    const isAbort = intervention?.status === 'aborted';
    const isTitleLoading = !hasResult && !isPending;

    const isPersistentExpanded = useChatStore((s) => {
      if (!toolMessageId) return undefined;

      const message = dbMessageSelectors.getDbMessageById(toolMessageId)(s);
      return message?.metadata?.inspectExpanded;
    });

    // Compute actual render state based on persistent expanded or hovered
    const shouldShowRender = isPersistentExpanded || isHovered;

    // Sync with parent state
    useEffect(() => {
      setShowRender(shouldShowRender);
    }, [shouldShowRender, setShowRender]);

    const showCustomPluginRender = shouldShowRender && !isPending && !isReject && !isAbort;
    return (
      <Flexbox className={styles.container} gap={4}>
        <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
          <Flexbox
            align={'center'}
            className={styles.tool}
            gap={8}
            horizontal
            onClick={() => {
              if (toolMessageId) toggleInspectExpanded(toolMessageId);
            }}
            onMouseEnter={() => {
              if (!isPersistentExpanded) {
                setIsHovered(true);
              }
            }}
            onMouseLeave={() => {
              if (!isPersistentExpanded) {
                setIsHovered(false);
              }
            }}
            paddingInline={4}
          >
            <ToolTitle
              apiName={apiName}
              identifier={identifier}
              index={index}
              isExpanded={isPersistentExpanded}
              isLoading={isTitleLoading}
              messageId={assistantMessageId}
              toolCallId={id}
            />
          </Flexbox>
          <Flexbox align={'center'} gap={8} horizontal>
            <Flexbox className={styles.actions} horizontal>
              {showCustomPluginRender && (
                <ActionIcon
                  icon={showPluginRender ? LogsIcon : LayoutPanelTop}
                  onClick={() => {
                    setShowPluginRender(!showPluginRender);
                  }}
                  size={'small'}
                  title={showPluginRender ? t('inspector.args') : t('inspector.pluginRender')}
                />
              )}
              <ActionIcon
                icon={showDebug ? LucideBugOff : LucideBug}
                onClick={() => {
                  setShowDebug(!showDebug);
                }}
                size={'small'}
                title={t(showDebug ? 'debug.off' : 'debug.on')}
              />
              <ActionIcon
                icon={Trash2}
                onClick={() => {
                  deleteAssistantMessage(assistantMessageId);
                }}
                size={'small'}
                title={t('inspector.delete')}
              />

              <Settings id={identifier} />
            </Flexbox>
            {hasResult && <StatusIndicator intervention={intervention} result={result} />}
          </Flexbox>
        </Flexbox>
        {showDebug && (
          <Debug
            apiName={apiName}
            identifier={identifier}
            requestArgs={requestArgs}
            result={result}
            toolCallId={id}
            type={type}
          />
        )}
      </Flexbox>
    );
  },
);

export default Inspectors;
