import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { Avatar, Icon, Tag } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { BadgeCheck, CircleUser } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors, pluginStoreSelectors } from '@/store/tool/selectors';

import PluginSettings from './PluginSettings';

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    color: ${token.colorTextDescription};
  `,
  link: css`
    color: ${token.colorText};
  `,
  tag: css`
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: bold;
    line-height: 2;
  `,
}));
const PluginItem = memo<LobeChatPluginMeta>(({ identifier, homepage, author, meta }) => {
  const [installed, installing, installPlugin, unInstallPlugin] = useToolStore((s) => [
    pluginSelectors.isPluginInstalled(identifier)(s),
    pluginStoreSelectors.isPluginInstallLoading(identifier)(s),
    s.installPlugin,
    s.uninstallPlugin,
  ]);
  const { mobile } = useResponsive();
  const { styles } = useStyles();

  const { t } = useTranslation('plugin');
  return (
    <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
      <Flexbox align={'center'} gap={8} horizontal>
        <Avatar avatar={meta.avatar} size={mobile ? 40 : 56} style={{ flex: 'none' }} />
        <Flexbox gap={4}>
          <Flexbox align={'center'} gap={8} horizontal>
            <Link className={styles.link} href={homepage} target={'_blank'}>
              <div className={styles.title}>{meta.title}</div>
            </Link>

            <Tag
              className={styles.tag}
              icon={<Icon icon={author === 'LobeHub' ? BadgeCheck : CircleUser} />}
            >
              {author}
            </Tag>
          </Flexbox>
          <div className={styles.desc}>{meta.description} </div>
        </Flexbox>
      </Flexbox>
      <Flexbox align={'center'} gap={8} horizontal>
        <PluginSettings identifier={identifier} />
        <Button
          loading={installing}
          onClick={() => {
            if (installed) {
              unInstallPlugin(identifier);
            } else installPlugin(identifier);
          }}
          size={mobile ? 'small' : undefined}
          type={installed ? 'default' : 'primary'}
        >
          {t(installed ? 'store.uninstall' : 'store.install')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

export default PluginItem;
