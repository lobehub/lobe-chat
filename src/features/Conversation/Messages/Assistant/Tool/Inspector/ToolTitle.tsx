import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Loader from '@/components/CircleLoader';
import PluginAvatar from '@/features/PluginAvatar';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { shinyTextStylish } from '@/styles/loading';
import { WebBrowsingManifest } from '@/tools/web-browsing';

export const useStyles = createStyles(({ css, token }) => ({
  apiName: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    text-overflow: ellipsis;
  `,

  shinyText: shinyTextStylish(token),
}));

interface ToolTitleProps {
  apiName: string;
  identifier: string;
  index: number;
  messageId: string;
  toolCallId: string;
}

const ToolTitle = memo<ToolTitleProps>(({ identifier, messageId, index, apiName, toolCallId }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  const isLoading = useChatStore((s) => {
    const toolMessageId = chatSelectors.getMessageByToolCallId(toolCallId)(s)?.id;
    const isToolCallStreaming = chatSelectors.isToolCallStreaming(messageId, index)(s);
    const isPluginApiInvoking = !toolMessageId
      ? true
      : chatSelectors.isPluginApiInvoking(toolMessageId)(s);
    return isToolCallStreaming || isPluginApiInvoking;
  });

  const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

  if (identifier === WebBrowsingManifest.identifier) {
    return (
      <Flexbox align={'center'} className={isLoading ? styles.shinyText : ''} gap={4} horizontal>
        {isLoading ? <Loader /> : <Icon icon={Globe} size={13} />}
        <div>{t('search.title')}</div>/<span className={styles.apiName}>{apiName}</span>
      </Flexbox>
    );
  }

  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

  return (
    <Flexbox align={'center'} className={isLoading ? styles.shinyText : ''} gap={4} horizontal>
      {isLoading ? <Loader /> : <PluginAvatar identifier={identifier} size={20} />}
      <div>{pluginTitle}</div>/<span className={styles.apiName}>{apiName}</span>
    </Flexbox>
  );
});

export default ToolTitle;
