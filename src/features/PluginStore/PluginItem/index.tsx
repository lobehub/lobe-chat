import { Avatar, Tooltip } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginTag from '@/features/PluginStore/PluginItem/PluginTag';
import { InstallPluginMeta } from '@/types/tool/plugin';

import Actions from './Action';

const { Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    margin: 0 !important;
    font-size: 12px;
    line-height: 1;
    color: ${token.colorTextDescription};
  `,
  link: css`
    overflow: hidden;
    color: ${token.colorText};
  `,
  title: css`
    margin: 0 !important;
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
  `,
}));

const PluginItem = memo<InstallPluginMeta>(({ identifier, homepage, author, type, meta = {} }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      gap={8}
      horizontal
      justify={'space-between'}
      style={{ position: 'relative' }}
    >
      <Flexbox
        align={'center'}
        flex={1}
        gap={8}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        <Avatar avatar={meta.avatar} style={{ flex: 'none', overflow: 'hidden' }} />
        <Flexbox flex={1} gap={4} style={{ overflow: 'hidden', position: 'relative' }}>
          <Flexbox align={'center'} gap={8} horizontal>
            <Tooltip title={identifier}>
              {homepage ? (
                <Link className={styles.link} href={homepage} target={'_blank'}>
                  <Paragraph className={styles.title} ellipsis={{ rows: 1 }}>
                    {meta.title}
                  </Paragraph>
                </Link>
              ) : (
                <Paragraph className={styles.title} ellipsis={{ rows: 1 }}>
                  {meta.title}
                </Paragraph>
              )}
            </Tooltip>
            <PluginTag author={author} type={type} />
          </Flexbox>
          <Paragraph className={styles.desc} ellipsis={{ rows: 1 }}>
            {meta.description}
          </Paragraph>
        </Flexbox>
      </Flexbox>
      <Actions identifier={identifier} type={type} />
    </Flexbox>
  );
});

export default PluginItem;
