import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

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

  expand: css`
    color: ${token.colorText};
  `,
  shinyText: shinyTextStylish(token),
}));

interface ToolTitleProps {
  apiName: string;
  identifier: string;
  index: number;
  isExpanded?: boolean;
  isLoading?: boolean;
  messageId: string;
  toolCallId: string;
}

const ToolTitle = memo<ToolTitleProps>(
  ({ identifier, apiName, isLoading, index, toolCallId, messageId, isExpanded }) => {
    const { t } = useTranslation('plugin');
    const { styles, cx } = useStyles();

    const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

    const plugins = useMemo(
      () => [
        {
          apiName: t(`search.apiName.${apiName}`, apiName),
          id: WebBrowsingManifest.identifier,
          title: t('search.title'),
        },
        {
          apiName: t(`localSystem.apiName.${apiName}`, apiName),
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
          isExpanded={isExpanded}
          isLoading={isLoading}
          messageId={messageId}
          toolCallId={toolCallId}
        />
      );
    }

    const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

    return (
      <Flexbox
        align={'center'}
        className={cx(isLoading && styles.shinyText, isExpanded && styles.expand)}
        gap={6}
        horizontal
      >
        <div>{pluginTitle}</div> <Icon icon={ChevronRight} />
        <span className={styles.apiName}>{apiName}</span>
      </Flexbox>
    );
  },
);

export default ToolTitle;
