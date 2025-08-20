import { Alert, Button, Highlighter, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { PlayIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { useChatStore } from '@/store/chat';
import { BuiltinRenderProps } from '@/types/tool';
import { PythonExecutionResult, PythonParams, PythonState } from '@/types/tool/python';

const Python = memo<
  BuiltinRenderProps<PythonExecutionResult | PythonParams, PythonParams, PythonState>
>(({ content, args, messageId, pluginState }) => {
  const { t } = useTranslation('tool');

  const theme = useTheme();
  const [executePythonCode] = useChatStore((s) => [s.executePythonCode]);
  const [isLocalExecuting, setIsLocalExecuting] = useState(false);

  // 判断内容类型：如果有 success 字段说明是执行结果，否则是参数
  const isExecutionResult = content && typeof content === 'object' && 'success' in content;
  const executionResult = isExecutionResult ? (content as PythonExecutionResult) : undefined;
  const code = isExecutionResult ? args?.code : (content as PythonParams)?.code || '';

  const isExecuting = pluginState?.isExecuting || isLocalExecuting;

  const handleExecute = useCallback(async () => {
    if (!code || isExecuting) return;

    setIsLocalExecuting(true);
    try {
      await executePythonCode(messageId, { code });
    } finally {
      setIsLocalExecuting(false);
    }
  }, [code, isExecuting, messageId, executePythonCode]);

  // 自动执行代码（只在没有执行结果时）
  useEffect(() => {
    if (!isExecutionResult && code && !isExecuting) {
      handleExecute();
    }
  }, [isExecutionResult, code, isExecuting, handleExecute]);

  return (
    <Flexbox gap={12}>
      {/* Python 代码显示 */}
      <Flexbox>
        <Highlighter actionIconSize="small" language="python" showLanguage={false}>
          {code}
        </Highlighter>
      </Flexbox>

      {/* 执行状态 */}
      {isExecuting && (
        <Flexbox gap={8} horizontal>
          <BubblesLoading />
          <Text type="secondary">{t('python.executing')}</Text>
        </Flexbox>
      )}

      {/* 执行结果 */}
      {!isExecuting && executionResult && (
        <Flexbox gap={8}>
          {/* 错误信息 */}
          {!executionResult.success && (
            <Alert
              description={executionResult.error}
              message={t('python.error')}
              showIcon
              type="error"
            />
          )}

          {/* 统一输出显示 */}
          {executionResult.output && executionResult.output.length > 0 && (
            <Flexbox>
              <Text strong style={{ marginBottom: 4 }}>
                {t('python.output')}
              </Text>
              <div
                style={{
                  backgroundColor: theme.colorBgContainer,
                  border: `1px solid ${theme.colorBorder}`,
                  borderRadius: theme.borderRadius,
                  fontSize: 13,
                  lineHeight: 1.5,
                  overflow: 'auto',
                  padding: 12,
                  whiteSpace: 'pre',
                }}
              >
                {executionResult.output.map((item, index) => (
                  <Text code key={index} type={item.type === 'stderr' ? 'danger' : undefined}>
                    {item.value}
                  </Text>
                ))}
              </div>
            </Flexbox>
          )}

          {/* 返回值 */}
          {executionResult.success && executionResult.result && (
            <Flexbox>
              <Text strong style={{ marginBottom: 4 }}>
                {t('python.returnValue')}
              </Text>
              <Highlighter copyable={false} language="text" showLanguage={false}>
                {executionResult.result}
              </Highlighter>
            </Flexbox>
          )}

          {/* 重新执行按钮 */}
          <Flexbox horizontal justify="flex-end">
            <Button icon={<PlayIcon size={14} />} onClick={handleExecute}>
              {t('python.rerun')}
            </Button>
          </Flexbox>
        </Flexbox>
      )}
    </Flexbox>
  );
});

Python.displayName = 'Python';

export default Python;
