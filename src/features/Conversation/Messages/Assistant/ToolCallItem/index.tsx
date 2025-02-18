import { Icon, Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { Loader2 } from 'lucide-react';
import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/features/PluginAvatar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import Arguments from '../../components/Arguments';
import ToolMessage from './Tool';
import { useStyles } from './style';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  showPortal?: boolean;
  style?: CSSProperties;
}

const CallItem = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, id, index, identifier, style, showPortal }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();

    const [open, setOpen] = useState(false);
    const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, index));
    const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(id));
    const isMobile = useIsMobile();

    const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

    const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

    // when tool calling stop streaming, we should show the tool message
    return !loading && toolMessage ? (
      <ToolMessage {...toolMessage} showPortal={showPortal} />
    ) : (
      <Flexbox gap={8} style={style}>
        <Flexbox
          align={'center'}
          className={styles.container}
          distribution={'space-between'}
          gap={8}
          horizontal
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Flexbox align={'center'} gap={8} horizontal>
            {loading ? (
              <div>
                <Icon icon={Loader2} spin />
              </div>
            ) : (
              <PluginAvatar identifier={identifier} size={isMobile ? 36 : undefined} />
            )}
            {isMobile ? (
              <Flexbox>
                <div>{pluginTitle}</div>
                <Typography.Text className={styles.apiName} type={'secondary'}>
                  {apiName}
                </Typography.Text>
              </Flexbox>
            ) : (
              <>
                <div>{pluginTitle}</div>
                <Tag>{apiName}</Tag>
              </>
            )}
          </Flexbox>
        </Flexbox>
        {loading && <Arguments arguments={requestArgs} />}
      </Flexbox>
    );
  },
);

export default CallItem;
