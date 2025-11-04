import { Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import { ChevronRightIcon } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// 内置工具标识符
const WEB_BROWSING_IDENTIFIER = 'lobe-web-browsing';
const LOCAL_SYSTEM_IDENTIFIER = 'lobe-local-system';

export interface ToolTitleProps {
  apiName: string;
  identifier: string;
}

/**
 * ToolTitle - 工具标题组件
 * 显示格式：{toolTitle} > {displayApiName}
 */
const ToolTitle = memo<ToolTitleProps>(({ identifier, apiName }) => {
  const { t } = useTranslation('tool');
  const theme = useTheme();

  // 获取工具标题（插件名称）
  const toolTitle = useMemo(() => {
    // 内置工具：Web 搜索
    if (identifier === WEB_BROWSING_IDENTIFIER) {
      return t('search.title');
    }

    // 内置工具：本地系统
    if (identifier === LOCAL_SYSTEM_IDENTIFIER) {
      return t('localSystem.title');
    }

    // 其他工具：显示 identifier
    return identifier || t('unknown');
  }, [identifier, t]);

  // 获取工具 API 名称（翻译后）
  const displayApiName = useMemo(() => {
    if (!apiName) return undefined;

    // 内置工具：Web 搜索 - 翻译 apiName
    if (identifier === WEB_BROWSING_IDENTIFIER) {
      return t(`search.apiName.${apiName}`, apiName);
    }

    // 内置工具：本地系统 - 翻译 apiName
    if (identifier === LOCAL_SYSTEM_IDENTIFIER) {
      return t(`localSystem.apiName.${apiName}`, apiName);
    }

    // 其他工具：直接显示 apiName
    return apiName;
  }, [apiName, identifier, t]);

  return (
    <Flexbox align="center" gap={4} horizontal>
      <Text ellipsis fontSize={14} type="secondary">
        {toolTitle}
      </Text>
      {displayApiName && (
        <>
          <ChevronRightIcon color={theme.colorTextTertiary} size={14} />
          <Text ellipsis fontSize={14} type="secondary">
            {displayApiName}
          </Text>
        </>
      )}
    </Flexbox>
  );
});

ToolTitle.displayName = 'ToolTitle';

export default ToolTitle;
