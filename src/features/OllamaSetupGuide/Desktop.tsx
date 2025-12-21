import { Ollama } from '@lobehub/icons';
import { Center } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import FormAction from '@/components/FormAction';

const OllamaDesktopSetupGuide = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('components');

  return (
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
    </Center>
  );
});

export default OllamaDesktopSetupGuide;
