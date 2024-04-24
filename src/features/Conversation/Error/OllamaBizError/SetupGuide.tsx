import { Highlighter, Snippet } from '@lobehub/ui';
import { Tab, Tabs } from '@lobehub/ui/mdx';
import { Steps } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls }) => ({
  steps: css`
    &.${prefixCls}-steps-small .${prefixCls}-steps-item-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: bold;
    }
  `,
}));

const SetupGuide = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('modelProvider');
  return (
    <Flexbox paddingBlock={8}>
      <Steps
        className={styles.steps}
        direction={'vertical'}
        items={[
          {
            description: (
              <Flexbox>
                {t('ollama.setup.install.description')}
                <Tabs items={['macOS', t('ollama.setup.install.windowsTab'), 'Linux', 'Docker']}>
                  <Tab>
                    <Trans i18nKey={'ollama.setup.install.macos'} ns={'modelProvider'}>
                      <Link href={'https://ollama.com/download'}>下载 Ollama for macOS</Link>
                      并解压。
                    </Trans>
                  </Tab>
                  <Tab>
                    <Trans i18nKey={'ollama.setup.install.windows'} ns={'modelProvider'}>
                      <Link href={'https://ollama.com/download'}>下载 Ollama for macOS</Link>
                      并解压。
                    </Trans>
                  </Tab>
                  <Tab>
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
                  </Tab>
                  <Tab>
                    <Flexbox gap={8}>
                      {t('ollama.setup.install.docker')}
                      <Snippet language={'bash'}>docker pull ollama/ollama</Snippet>
                    </Flexbox>
                  </Tab>
                </Tabs>
              </Flexbox>
            ),
            status: 'process',
            title: t('ollama.setup.install.title'),
          },
          {
            description: (
              <Flexbox>
                {t('ollama.setup.cors.description')}

                <Tabs items={['macOS', t('ollama.setup.install.windowsTab'), 'Linux']}>
                  <Tab>
                    <Flexbox gap={8}>
                      {t('ollama.setup.cors.macos')}
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      <Snippet language={'bash'}>launchctl setenv OLLAMA_ORIGINS "*"</Snippet>
                      {t('ollama.setup.cors.reboot')}
                    </Flexbox>
                  </Tab>
                  <Tab>
                    <Flexbox gap={8}>
                      <div>{t('ollama.setup.cors.windows')}</div>
                      <div>{t('ollama.setup.cors.reboot')}</div>
                    </Flexbox>
                  </Tab>
                  <Tab>
                    {' '}
                    <Flexbox gap={8}>
                      {t('ollama.setup.cors.linux.systemd')}
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
                  </Tab>
                </Tabs>
              </Flexbox>
            ),
            status: 'process',
            title: t('ollama.setup.cors.title'),
          },
        ]}
        size={'small'}
      />
    </Flexbox>
  );
});

export default SetupGuide;
