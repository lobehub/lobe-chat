import { ActionIcon, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ChevronDown, ChevronRight, LucideBug, LucideBugOff } from 'lucide-react';
import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/features/PluginAvatar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { shinyTextStylish } from '@/styles/loading';

import Arguments from './Arguments';
import Debug from './Debug';
import Loader from './Loader';
import Settings from './Settings';

export const useStyles = createStyles(({ css, token }) => ({
  apiName: css`
    overflow: hidden;
    display: -webkit-box;
    font-family: ${token.fontFamilyCode};
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-size: 12px;
    text-overflow: ellipsis;
  `,
  container: css`
    cursor: pointer;

    width: fit-content;
    padding-block: 2px;
    border-radius: 6px;

    color: ${token.colorTextTertiary};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  plugin: css`
    display: flex;
    gap: 4px;
    align-items: center;
    width: fit-content;
  `,
  shinyText: shinyTextStylish(token),
}));

interface InspectorProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  showPortal?: boolean;
  style?: CSSProperties;
}

const Inspectors = memo<InspectorProps>(
  ({ messageId, index, identifier, apiName, arguments: requestArgs, payload }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();

    const [showArgs, setShowArgs] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, index));
    const isMobile = useIsMobile();

    const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);
    const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

    return (
      <Flexbox gap={4}>
        <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
          <Flexbox
            align={'center'}
            className={styles.container}
            gap={8}
            horizontal
            onClick={() => {
              setShowArgs(!showArgs);
            }}
            paddingInline={4}
          >
            <Flexbox
              align={'center'}
              className={loading ? styles.shinyText : ''}
              gap={4}
              horizontal
            >
              {loading ? (
                <Loader />
              ) : (
                <PluginAvatar identifier={identifier} size={isMobile ? 36 : 24} />
              )}

              {isMobile ? (
                <Flexbox>
                  <div>{pluginTitle}</div>
                  <span className={styles.apiName}>{apiName}</span>
                </Flexbox>
              ) : (
                <>
                  <div>{pluginTitle}</div>/<span className={styles.apiName}>{apiName}</span>
                </>
              )}
            </Flexbox>
            <Icon icon={showArgs ? ChevronDown : ChevronRight} />
          </Flexbox>

          <Flexbox horizontal>
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
        {showDebug && <Debug payload={payload} requestArgs={requestArgs} />}
        {(loading || showArgs) && !showDebug && <Arguments arguments={requestArgs} />}
      </Flexbox>
    );
  },
);

export default Inspectors;
