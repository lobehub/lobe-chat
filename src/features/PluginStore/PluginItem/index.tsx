import { Text, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MCPTag from '@/components/Plugins/MCPTag';
import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';
import { InstallPluginMeta } from '@/types/tool/plugin';

import Actions from './Action';

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

interface PluginItemProps extends InstallPluginMeta {
  isMCP?: boolean;
}
const PluginItem = memo<PluginItemProps>(
  ({ identifier, homepage, author, type, meta = {}, isMCP }) => {
    const { styles } = useStyles();

    return (
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        justify={'space-between'}
        paddingBlock={12}
        paddingInline={16}
        style={{ position: 'relative' }}
      >
        <Flexbox
          align={'center'}
          flex={1}
          gap={8}
          horizontal
          style={{ overflow: 'hidden', position: 'relative' }}
        >
          <PluginAvatar avatar={meta.avatar} />
          <Flexbox flex={1} gap={4} style={{ overflow: 'hidden', position: 'relative' }}>
            <Flexbox align={'center'} gap={8} horizontal>
              <Tooltip title={identifier}>
                {homepage ? (
                  <Link className={styles.link} href={homepage} target={'_blank'}>
                    <Text className={styles.title} ellipsis>
                      {meta.title}
                    </Text>
                  </Link>
                ) : (
                  <Text className={styles.title} ellipsis>
                    {meta.title}
                  </Text>
                )}
              </Tooltip>
              <PluginTag author={author} type={type} />
              {isMCP && <MCPTag />}
            </Flexbox>
            <Text className={styles.desc} ellipsis>
              {meta.description}
            </Text>
          </Flexbox>
        </Flexbox>
        <Actions identifier={identifier} isMCP={isMCP} type={type} />
      </Flexbox>
    );
  },
);

export default PluginItem;
