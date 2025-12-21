import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { shinyTextStylish } from '@/styles/loading';
import { builtinToolIdentifiers } from '@/tools/identifiers';

export const useStyles = createStyles(({ css, token }) => ({
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-family: ${token.fontFamilyCode};
    color: ${token.colorTextDescription};
  `,
  shinyText: shinyTextStylish(token),
}));

interface ToolTitleProps {
  apiName: string;
  identifier: string;
  isLoading?: boolean;
}

const ToolTitle = memo<ToolTitleProps>(({ identifier, apiName, isLoading }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);
  const isBuiltinPlugin = builtinToolIdentifiers.includes(identifier);
  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

  return (
    <div className={cx(styles.root, isLoading && styles.shinyText)}>
      <span>
        {isBuiltinPlugin
          ? t(`builtins.${identifier}.title`, {
              defaultValue: identifier,
            })
          : pluginTitle}
      </span>
      <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
      <span>
        {isBuiltinPlugin
          ? t(`builtins.${identifier}.apiName.${apiName}`, {
              defaultValue: apiName,
            })
          : apiName}
      </span>
    </div>
  );
});

export default ToolTitle;
