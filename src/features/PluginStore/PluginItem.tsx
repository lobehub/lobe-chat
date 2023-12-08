import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { Avatar, Tag } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors, pluginStoreSelectors } from '@/store/tool/selectors';

import PluginSettings from './PluginSettings';

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    color: ${token.colorTextSecondary};
  `,
  link: css`
    color: ${token.colorTextDescription};
  `,
  tag: css`
    font-weight: normal;
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: bold;
    line-height: 2;
  `,
}));
const PluginItem = memo<LobeChatPluginMeta>(({ identifier, createdAt, homepage, author, meta }) => {
  const [installed, installing, installPlugin, unInstallPlugin] = useToolStore((s) => [
    pluginSelectors.isPluginInstalled(identifier)(s),
    pluginStoreSelectors.isPluginInstallLoading(identifier)(s),
    s.installPlugin,
    s.uninstallPlugin,
  ]);
  const { styles } = useStyles();

  const { t } = useTranslation('plugin');
  return (
    <Flexbox gap={8} padding={16}>
      <Flexbox horizontal justify={'space-between'}>
        <Avatar avatar={meta.avatar} size={56} style={{ flex: 'none' }} />

        <Flexbox gap={8} horizontal>
          <PluginSettings identifier={identifier} />
          <Button
            loading={installing}
            onClick={() => {
              if (installed) {
                unInstallPlugin(identifier);
              } else installPlugin(identifier);
            }}
            type={installed ? 'default' : 'primary'}
          >
            {t(installed ? 'store.uninstall' : 'store.install')}
          </Button>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={4}>
        <Flexbox align={'center'} gap={8} horizontal>
          <div className={styles.title}>{meta.title}</div>
          <Tag className={styles.tag}> {identifier}</Tag>
        </Flexbox>
        <div className={styles.desc}>{meta.description}</div>
        <Flexbox className={styles.link} gap={8} horizontal>
          {author && (
            <Link className={styles.link} href={homepage} target={'_blank'}>
              @{author}
            </Link>
          )}
          {t('store.releasedAt', { createdAt })}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default PluginItem;
