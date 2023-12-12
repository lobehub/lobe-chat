import { Avatar, Icon, Tag } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { BadgeCheck, CircleUser } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { InstallPluginMeta } from '@/types/tool/plugin';

import Actions from './Action';

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

const PluginItem = memo<InstallPluginMeta>(({ identifier, homepage, author, type, meta = {} }) => {
  const { styles } = useStyles();
  const { mobile } = useResponsive();
  const isCustomPlugin = type === 'customPlugin';
  const { t } = useTranslation('plugin');

  return (
    <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
      <Flexbox align={'center'} gap={8} horizontal>
        <Avatar avatar={meta.avatar} size={mobile ? 40 : 56} style={{ flex: 'none' }} />
        <Flexbox gap={4}>
          <Flexbox align={'center'} gap={8} horizontal>
            {homepage ? (
              <Link className={styles.link} href={homepage} target={'_blank'}>
                <div className={styles.title}>{meta.title}</div>
              </Link>
            ) : (
              <div className={styles.title}>{meta.title}</div>
            )}

            {author && (
              <Tag
                className={styles.tag}
                icon={<Icon icon={author === 'LobeHub' ? BadgeCheck : CircleUser} />}
              >
                {author}
              </Tag>
            )}
            {isCustomPlugin && (
              <Tag bordered={false} color={'gold'}>
                {t('store.customPlugin')}
              </Tag>
            )}
          </Flexbox>
          <div className={styles.desc}>{meta.description}</div>
        </Flexbox>
      </Flexbox>
      <Actions identifier={identifier} type={type} />
    </Flexbox>
  );
});

export default PluginItem;
