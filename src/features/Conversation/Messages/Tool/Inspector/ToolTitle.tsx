import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { shinyTextStylish } from '@/styles/loading';
import { builtinToolIdentifiers } from '@/tools/identifiers';

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

  const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

  if (builtinToolIdentifiers.includes(identifier)) {
    return (
      <BuiltinPluginTitle
        apiName={t(`builtins.${identifier}.apiName.${apiName}`, apiName)}
        identifier={identifier}
        index={index}
        messageId={messageId}
        title={t(`builtins.${identifier}.title`, identifier)}
        toolCallId={toolCallId}
      />
    );
  }

  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

  return (
    <Flexbox align={'center'} gap={6} horizontal>
      <div>{pluginTitle}</div> <Icon icon={ChevronRight} />
      <span className={styles.apiName}>{apiName}</span>
    </Flexbox>
  );
});

export default ToolTitle;
