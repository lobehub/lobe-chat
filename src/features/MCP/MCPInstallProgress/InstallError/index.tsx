import { Alert } from '@lobehub/ui';
import { Button } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { MCPErrorInfo } from '@/types/plugins';

import ErrorDetails from './ErrorDetails';

interface InstallErrorProps {
  errorInfo: MCPErrorInfo;
  identifier: string;
}

const InstallError = memo<InstallErrorProps>(({ errorInfo, identifier }) => {
  const { t } = useTranslation(['plugin', 'common']);

  const cancelInstallMCPPlugin = useToolStore((s) => s.cancelInstallMCPPlugin);

  return (
    <Flexbox gap={8}>
      <Alert
        action={
          <Flexbox>
            <Button
              color={'default'}
              onClick={() => {
                cancelInstallMCPPlugin(identifier);
              }}
              size={'small'}
              variant={'filled'}
            >
              {t('common:close')}
            </Button>
          </Flexbox>
        }
        message={t('mcpInstall.installError', {
          detail: t(`mcpInstall.errorTypes.${errorInfo.type}`),
        })}
        type="error"
        variant={'borderless'}
      />
      {errorInfo.metadata && (
        <ErrorDetails errorInfo={errorInfo.metadata} errorMessage={errorInfo.message} />
      )}
    </Flexbox>
  );
});
export default InstallError;
