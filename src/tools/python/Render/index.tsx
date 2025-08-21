import { Alert, Highlighter, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { BuiltinRenderProps } from '@/types/tool';
import { PythonExecutionResult, PythonParams, PythonState } from '@/types/tool/python';

import PythonFileGallery from './components/PythonFileGallery';

const Python = memo<BuiltinRenderProps<PythonExecutionResult, PythonParams, PythonState>>(
  ({ content, args, messageId, pluginState }) => {
    const { t } = useTranslation('tool');
    const theme = useTheme();

    const isExecuting = pluginState?.isExecuting || false;

    return (
      <Flexbox gap={12}>
        {/* Python 代码显示 */}
        <Flexbox>
          <Highlighter actionIconSize="small" language="python" showLanguage={false}>
            {args.code}
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
        {!isExecuting && content && (
          <Flexbox gap={8}>
            {/* 错误信息 */}
            {content.success === false && (
              <Alert
                description={content.error}
                message={t('python.error')}
                showIcon
                type="error"
              />
            )}

            {/* 输出 */}
            {content.output && content.output.length > 0 && (
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
                  {content.output.map((item, index) => (
                    <Text code key={index} type={item.type === 'stderr' ? 'danger' : undefined}>
                      {item.value}
                    </Text>
                  ))}
                </div>
              </Flexbox>
            )}

            {/* 返回值 */}
            {content.success && content.result && (
              <Flexbox>
                <Text strong style={{ marginBottom: 4 }}>
                  {t('python.returnValue')}
                </Text>
                <Highlighter copyable={false} language="text" showLanguage={false}>
                  {content.result}
                </Highlighter>
              </Flexbox>
            )}

            {/* 文件显示 */}
            {content.files && content.files.length > 0 && (
              <Flexbox>
                <Text strong style={{ marginBottom: 8 }}>
                  {t('python.files')}
                </Text>
                <PythonFileGallery files={content.files} messageId={messageId} />
              </Flexbox>
            )}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default Python;
