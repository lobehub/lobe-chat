import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LayoutPanelTop, LogsIcon, LucideBug, LucideBugOff } from 'lucide-react';
import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { shinyTextStylish } from '@/styles/loading';

import Debug from './Debug';
import Settings from './Settings';
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
  hidePluginUI?: boolean;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  setShowPluginRender: (show: boolean) => void;
  showPluginRender: boolean;
  showPortal?: boolean;
  style?: CSSProperties;
}

const Inspectors = memo<InspectorProps>(
  ({
    messageId,
    index,
    identifier,
    apiName,
    id,
    arguments: requestArgs,
    payload,
    showPluginRender,
    setShowPluginRender,
    hidePluginUI = false,
  }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();

    const [showDebug, setShowDebug] = useState(false);

    return (
      <Flexbox className={styles.container} gap={4}>
        <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
          <Flexbox align={'center'} className={styles.tool} gap={8} horizontal paddingInline={4}>
            <ToolTitle
              apiName={apiName}
              identifier={identifier}
              index={index}
              messageId={messageId}
              toolCallId={id}
            />
          </Flexbox>
          <Flexbox className={styles.actions} horizontal>
            {!hidePluginUI && (
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
            <Settings id={identifier} />
          </Flexbox>
        </Flexbox>
        {showDebug && <Debug payload={payload} requestArgs={requestArgs} toolCallId={id} />}
      </Flexbox>
    );
  },
);

export default Inspectors;
