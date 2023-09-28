import { CheckCircleFilled } from '@ant-design/icons';
import { Highlighter } from '@lobehub/ui';
import { Alert, Button } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatMessageError } from '@/types/chatMessage';
import { fetchPresetTaskResult } from '@/utils/fetch';

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

    const data = await fetchPresetTaskResult({
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
          <Alert banner message={error.message} showIcon type={'error'}></Alert>
          <Flexbox style={{ maxWidth: 600 }}>
            <Highlighter language={'json'}>{JSON.stringify(error.body, null, 2)}</Highlighter>
          </Flexbox>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default Checker;
