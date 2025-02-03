import { Highlighter, Snippet, TabsNav } from '@lobehub/ui';
import { Steps } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { readableColor } from 'polished';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls, token }) => ({
  steps: css`
    margin-block-start: 32px;
    &.${prefixCls}-steps-small .${prefixCls}-steps-item-title {
      margin-block-end: 16px;
      font-size: 16px;
      font-weight: bold;
    }

    .${prefixCls}-steps-item-description {
      margin-block-end: 24px;
    }

    .${prefixCls}-steps-icon {
      color: ${readableColor(token.colorPrimary)} !important;
    }
  `,
}));

const SetupGuide = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('components');
  return (
    <TabsNav
      items={[
        {
          children: (
            <Steps
              className={styles.steps}
              direction={'vertical'}
              items={[
                {
                  description: (
                    <Trans i18nKey={'OllamaSetupGuide.install.description'} ns={'components'}>
                      请确认你已经开启 Ollama ，如果没有安装 Ollama ，请前往官网
                      <Link href={'https://ollama.com/download'}>下载</Link>
                    </Trans>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.install.title'),
                },
                {
                  description: (
                    <Flexbox gap={8}>
                      {t('OllamaSetupGuide.cors.description')}

                      <Flexbox gap={8}>
                        {t('OllamaSetupGuide.cors.macos')}
                        <Snippet language={'bash'}>
                          {/* eslint-disable-next-line react/no-unescaped-entities */}
                          launchctl setenv OLLAMA_ORIGINS "*"
                        </Snippet>
                        {t('OllamaSetupGuide.cors.reboot')}
                      </Flexbox>
                    </Flexbox>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.cors.title'),
                },
              ]}
              size={'small'}
            />
          ),
          key: 'macos',
          label: 'macOS',
        },
        {
          children: (
            <Steps
              className={styles.steps}
              direction={'vertical'}
              items={[
                {
                  description: (
                    <Trans i18nKey={'OllamaSetupGuide.install.description'} ns={'components'}>
                      请确认你已经开启 Ollama ，如果没有安装 Ollama ，请前往官网
                      <Link href={'https://ollama.com/download'}>下载</Link>
                    </Trans>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.install.title'),
                },
                {
                  description: (
                    <Flexbox gap={8}>
                      {t('OllamaSetupGuide.cors.description')}
                      <div>{t('OllamaSetupGuide.cors.windows')}</div>
                      <div>{t('OllamaSetupGuide.cors.reboot')}</div>
                    </Flexbox>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.cors.title'),
                },
              ]}
              size={'small'}
            />
          ),
          key: 'windows',
          label: t('OllamaSetupGuide.install.windowsTab'),
        },
        {
          children: (
            <Steps
              className={styles.steps}
              direction={'vertical'}
              items={[
                {
                  description: (
                    <Flexbox gap={8}>
                      {t('OllamaSetupGuide.install.linux.command')}
                      <Snippet language={'bash'}>
                        curl -fsSL https://ollama.com/install.sh | sh
                      </Snippet>
                      <div>
                        <Trans i18nKey={'OllamaSetupGuide.install.linux.manual'} ns={'components'}>
                          或者，你也可以参考
                          <Link href={'https://github.com/ollama/ollama/blob/main/docs/linux.md'}>
                            Linux 手动安装指南
                          </Link>
                          。
                        </Trans>
                      </div>
                    </Flexbox>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.install.title'),
                },
                {
                  description: (
                    <Flexbox gap={8}>
                      <div>{t('OllamaSetupGuide.cors.description')}</div>

                      <div>{t('OllamaSetupGuide.cors.linux.systemd')}</div>
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      <Snippet language={'bash'}> sudo systemctl edit ollama.service</Snippet>
                      {t('OllamaSetupGuide.cors.linux.env')}
                      <Highlighter
                        // eslint-disable-next-line react/no-children-prop
                        children={`[Service]

Environment="OLLAMA_ORIGINS=*"`}
                        fileName={'ollama.service'}
                        fullFeatured
                        language={'bash'}
                        showLanguage
                      />
                      {t('OllamaSetupGuide.cors.linux.reboot')}
                    </Flexbox>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.cors.title'),
                },
              ]}
              size={'small'}
            />
          ),
          key: 'linux',
          label: 'Linux',
        },
        {
          children: (
            <Steps
              className={styles.steps}
              direction={'vertical'}
              items={[
                {
                  description: (
                    <Flexbox gap={8}>
                      {t('OllamaSetupGuide.install.description')}
                      <div>{t('OllamaSetupGuide.install.docker')}</div>
                      <Snippet language={'bash'}>docker pull ollama/ollama</Snippet>
                    </Flexbox>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.install.title'),
                },
                {
                  description: (
                    <Flexbox gap={8}>
                      {t('OllamaSetupGuide.cors.description')}
                      <Highlighter
                        fileName={'ollama.service'}
                        fullFeatured
                        language={'bash'}
                        showLanguage
                      >
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        docker run -d --gpus=all -v ollama:/root/.ollama -e OLLAMA_ORIGINS="*" -p
                        11434:11434 --name ollama ollama/ollama
                      </Highlighter>
                    </Flexbox>
                  ),
                  status: 'process',
                  title: t('OllamaSetupGuide.cors.title'),
                },
              ]}
              size={'small'}
            />
          ),
          key: 'docker',
          label: 'Docker',
        },
      ]}
    />
  );
});

export default SetupGuide;
