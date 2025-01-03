import { CheckCircleFilled } from '@ant-design/icons';
import { Alert, Highlighter } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { ListResponse } from 'ollama/browser';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ollamaService } from '@/services/ollama';

const OllamaChecker = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  const { data, error, isLoading, mutate } = useSWR<ListResponse>(
    'ollama.list',
    ollamaService.getModels,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
    },
  );

  const checkConnection = () => {
    mutate().catch();
  };

  const isMobile = useIsMobile();

  return (
    <Flexbox align={isMobile ? 'flex-start' : 'flex-end'} gap={8}>
      <Flexbox align={'center'} direction={isMobile ? 'horizontal-reverse' : 'horizontal'} gap={12}>
        {!error && data?.models && (
          <Flexbox gap={4} horizontal>
            <CheckCircleFilled
              style={{
                color: theme.colorSuccess,
              }}
            />
            {t('llm.checker.pass')}
          </Flexbox>
        )}
        <Button loading={isLoading} onClick={checkConnection}>
          {t('llm.checker.button')}
        </Button>
      </Flexbox>
      {error && (
        <Flexbox gap={8} style={{ maxWidth: '600px', width: '100%' }}>
          <Alert
            banner
            extra={
              <Flexbox>
                <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
                  {JSON.stringify(error.body || error, null, 2)}
                </Highlighter>
              </Flexbox>
            }
            message={t(`response.${error.type}` as any, { ns: 'error' })}
            showIcon
            type={'error'}
          />
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default OllamaChecker;
