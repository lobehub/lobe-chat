import { Highlighter, Icon } from '@lobehub/ui';
import { Button, Tag } from 'antd';
import { useTheme } from 'antd-style';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MCPErrorInfoMetadata } from '@/types/plugins';

const ErrorDetails = memo<{
  errorInfo: MCPErrorInfoMetadata;
  errorMessage?: string;
}>(({ errorInfo, errorMessage }) => {
  const { t } = useTranslation('plugin');
  const [expanded, setExpanded] = useState(false);

  const theme = useTheme();
  return (
    <Flexbox gap={8}>
      <Button
        color={'default'}
        icon={<Icon icon={expanded ? ChevronDown : ChevronRight} />}
        onClick={() => setExpanded(!expanded)}
        size="small"
        style={{
          fontSize: '12px',
          padding: '0 4px',
        }}
        variant="filled"
      >
        {expanded
          ? t('mcpInstall.errorDetails.hideDetails')
          : t('mcpInstall.errorDetails.showDetails')}
      </Button>

      {expanded && (
        <motion.div
          animate={{ height: 'auto', opacity: 1 }}
          initial={{ height: 0, opacity: 0 }}
          style={{ overflow: 'hidden' }}
        >
          <Flexbox
            gap={8}
            style={{
              backgroundColor: theme.colorFillQuaternary,
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: '11px',
              padding: '8px 12px',
            }}
          >
            {errorInfo.params && (
              <Flexbox gap={4}>
                <div>
                  <Tag bordered={false} color="blue">
                    {t('mcpInstall.errorDetails.connectionParams')}
                  </Tag>
                </div>
                <div style={{ marginTop: 4, wordBreak: 'break-all' }}>
                  {errorInfo.params.command && (
                    <div>
                      {t('mcpInstall.errorDetails.command')}: {errorInfo.params.command}
                    </div>
                  )}
                  {errorInfo.params.args && (
                    <div>
                      {t('mcpInstall.errorDetails.args')}: {errorInfo.params.args.join(' ')}
                    </div>
                  )}
                </div>
              </Flexbox>
            )}

            {errorInfo.errorLog && (
              <Flexbox gap={4}>
                <div>
                  <Tag bordered={false} color="red">
                    {t('mcpInstall.errorDetails.errorOutput')}
                  </Tag>
                </div>
                <Highlighter
                  language={'log'}
                  style={{
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {errorInfo.errorLog}
                </Highlighter>
              </Flexbox>
            )}

            {errorInfo.originalError && errorInfo.originalError !== errorMessage && (
              <div>
                <Tag color="orange">{t('mcpInstall.errorDetails.originalError')}</Tag>
                <div style={{ marginTop: 4, wordBreak: 'break-all' }}>
                  {errorInfo.originalError}
                </div>
              </div>
            )}
          </Flexbox>
        </motion.div>
      )}
    </Flexbox>
  );
});

export default ErrorDetails;
