import { Ollama } from '@lobehub/icons';
import { Button } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import FormAction from '@/components/FormAction';
import { useChatStore } from '@/store/chat';

import { ErrorActionContainer } from '../style';

const OllamaDesktopSetupGuide = memo<{ id: string }>(({ id }) => {
  const theme = useTheme();
  const { t } = useTranslation('components');

  const [delAndRegenerateMessage, deleteMessage] = useChatStore((s) => [
    s.delAndRegenerateMessage,
    s.deleteMessage,
  ]);

  return (
    <ErrorActionContainer style={{ paddingBlock: 0 }}>
      <Center gap={16} paddingBlock={32} style={{ maxWidth: 300, width: '100%' }}>
        <FormAction
          avatar={<Ollama color={theme.colorPrimary} size={64} />}
          description={
            <span>
              <Trans i18nKey={'OllamaSetupGuide.install.description'} ns={'components'}>
                请确认你已经开启 Ollama ，如果没有安装 Ollama ，请前往官网
                <Link href={'https://ollama.com/download'}>下载</Link>
              </Trans>
            </span>
          }
          title={t('OllamaSetupGuide.install.title')}
        />
        <Button
          block
          onClick={() => {
            delAndRegenerateMessage(id);
          }}
          style={{ marginTop: 8 }}
          type={'primary'}
        >
          {t('OllamaSetupGuide.action.start')}
        </Button>
        <Button
          block
          onClick={() => {
            deleteMessage(id);
          }}
        >
          {t('OllamaSetupGuide.action.close')}
        </Button>
      </Center>
    </ErrorActionContainer>
  );
});

export default OllamaDesktopSetupGuide;
