import { CheckCircleFilled } from '@ant-design/icons';
import { Alert, Highlighter } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { chatService } from '@/services/chat';
import { ChatMessageError } from '@/types/chatMessage';

import { getModelList } from './getModelList';

interface CheckerProps {
  checkModel?: boolean;
}
const Checker = memo<CheckerProps>(({ checkModel }) => {
  const { t } = useTranslation('setting');

  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(false);

  const theme = useTheme();
  const [error, setError] = useState<ChatMessageError | undefined>();

  const checkConnection = async () => {
    if (checkModel) {
      getModelList();
    }

    const data = await chatService.fetchPresetTaskResult({
      onError: (_, rawError) => {
        setError(rawError);
      },
      onLoadingChange: (loading) => {
        setLoading(loading);
      },
      params: {
        messages: [
          {
            content: '你好',
            role: 'user',
          },
        ],
        model: 'gpt-3.5-turbo',
      },
    });

    if (data) {
      setError(undefined);
      setPass(true);
    }
  };
  return (
    <Flexbox gap={8}>
      <Flexbox align={'center'} gap={12} horizontal>
        <Button loading={loading} onClick={checkConnection}>
          {t('llm.OpenAI.check.button')}
        </Button>

        {pass && (
          <Flexbox gap={4} horizontal>
            <CheckCircleFilled
              style={{
                color: theme.colorSuccess,
              }}
            />
            {t('llm.OpenAI.check.pass')}
          </Flexbox>
        )}
      </Flexbox>

      {error && (
        <Flexbox gap={8}>
          <Alert
            banner
            extra={
              <Flexbox style={{ maxWidth: 600 }}>
                <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
                  {JSON.stringify(error.body, null, 2)}
                </Highlighter>
              </Flexbox>
            }
            message={error.message}
            showIcon
            type={'error'}
          />
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default Checker;
