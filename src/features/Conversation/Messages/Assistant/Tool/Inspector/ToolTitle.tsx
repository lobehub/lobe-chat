import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { shinyTextStylish } from '@/styles/loading';
import { LocalSystemManifest } from '@/tools/local-system';
import { WebBrowsingManifest } from '@/tools/web-browsing';

import BuiltinPluginTitle from './BuiltinPluginTitle';

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

  const isLoading = useChatStore(chatSelectors.isToolApiNameShining(messageId, index, toolCallId));

  const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

  const plugins = useMemo(
    () => [
      {
        apiName: t(`search.apiName.${apiName}`, apiName),
        // icon: <Icon icon={Globe} size={13} />,
        id: WebBrowsingManifest.identifier,
        title: t('search.title'),
      },
      {
        apiName: t(`localSystem.apiName.${apiName}`, apiName),
        // icon: <Icon icon={Laptop} size={13} />,
        id: LocalSystemManifest.identifier,
        title: t('localSystem.title'),
      },
    ],
    [],
  );

  const builtinPluginTitle = plugins.find((item) => item.id === identifier);

  if (!!builtinPluginTitle) {
    return (
      <BuiltinPluginTitle
        {...builtinPluginTitle}
        identifier={identifier}
        index={index}
        messageId={messageId}
        toolCallId={toolCallId}
      />
    );
  }

  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

  return (
    <Flexbox align={'center'} className={isLoading ? styles.shinyText : ''} gap={6} horizontal>
      <div>{pluginTitle}</div> <Icon icon={ChevronRight} />
      <span className={styles.apiName}>{apiName}</span>
    </Flexbox>
  );
});

export default ToolTitle;
