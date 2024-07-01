import { Highlighter, Snippet, TabsNav } from '@lobehub/ui';
import { Steps } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { readableColor } from 'polished';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ErrorActionContainer } from '@/features/Conversation/Error/style';

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
  const { t } = useTranslation('modelProvider');
  return (
    <ErrorActionContainer style={{ paddingBlock: 0 }}>
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
                      <Trans i18nKey={'ollama.setup.install.description'} ns={'modelProvider'}>
                        请确认你已经开启 Ollama ，如果没有安装 Ollama ，请前往官网
                        <Link href={'https://ollama.com/download'}>下载</Link>
                      </Trans>
                    ),
                    status: 'process',
                    title: t('ollama.setup.install.title'),
                  },
                  {
                    description: (
                      <Flexbox gap={8}>
                        {t('ollama.setup.cors.description')}

                        <Flexbox gap={8}>
                          {t('ollama.setup.cors.macos')}
                          <Snippet language={'bash'}>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            launchctl setenv OLLAMA_ORIGINS "*"
                          </Snippet>
                          {t('ollama.setup.cors.reboot')}
                        </Flexbox>
                      </Flexbox>
                    ),
                    status: 'process',
                    title: t('ollama.setup.cors.title'),
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
                      <Trans i18nKey={'ollama.setup.install.description'} ns={'modelProvider'}>
                        请确认你已经开启 Ollama ，如果没有安装 Ollama ，请前往官网
                        <Link href={'https://ollama.com/download'}>下载</Link>
                      </Trans>
                    ),
                    status: 'process',
                    title: t('ollama.setup.install.title'),
                  },
                  {
                    description: (
                      <Flexbox gap={8}>
                        {t('ollama.setup.cors.description')}
                        <div>{t('ollama.setup.cors.windows')}</div>
                        <div>{t('ollama.setup.cors.reboot')}</div>
                      </Flexbox>
                    ),
                    status: 'process',
                    title: t('ollama.setup.cors.title'),
                  },
                ]}
                size={'small'}
              />
            ),
            key: 'windows',
            label: t('ollama.setup.install.windowsTab'),
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
                        {t('ollama.setup.install.linux.command')}
                        <Snippet language={'bash'}>
                          curl -fsSL https://ollama.com/install.sh | sh
                        </Snippet>
                        <div>
                          <Trans i18nKey={'ollama.setup.install.linux.manual'} ns={'modelProvider'}>
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
                    title: t('ollama.setup.install.title'),
                  },
                  {
                    description: (
                      <Flexbox gap={8}>
                        <div>{t('ollama.setup.cors.description')}</div>

                        <div>{t('ollama.setup.cors.linux.systemd')}</div>
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        <Snippet language={'bash'}> sudo systemctl edit ollama.service</Snippet>
                        {t('ollama.setup.cors.linux.env')}
                        <Highlighter
                          // eslint-disable-next-line react/no-children-prop
                          children={`[Service]

Environment="OLLAMA_ORIGINS=*"`}
                          fileName={'ollama.service'}
                          fullFeatured
                          language={'bash'}
                          showLanguage
                        />
                        {t('ollama.setup.cors.linux.reboot')}
                      </Flexbox>
                    ),
                    status: 'process',
                    title: t('ollama.setup.cors.title'),
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
                        {t('ollama.setup.install.description')}
                        <div>{t('ollama.setup.install.docker')}</div>
                        <Snippet language={'bash'}>docker pull ollama/ollama</Snippet>
                      </Flexbox>
                    ),
                    status: 'process',
                    title: t('ollama.setup.install.title'),
                  },
                  {
                    description: (
                      <Flexbox gap={8}>
                        {t('ollama.setup.cors.description')}
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
                    title: t('ollama.setup.cors.title'),
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
    </ErrorActionContainer>
  );
});

export default SetupGuide;
