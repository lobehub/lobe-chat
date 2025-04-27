import { Block, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/features/PluginAvatar';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    flex: none;
  `,
  desc: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    font-size: 16px;
    font-weight: 500;
  `,
}));

const Meta = memo<{
  id: string;
}>(({ id }) => {
  const pluginMeta = useToolStore(pluginSelectors.getPluginMetaById(id), isEqual);
  const { styles } = useStyles();

  const desc = pluginHelpers.getPluginDesc(pluginMeta);

  return (
    <Block gap={16} padding={16} variant={'filled'}>
      <Flexbox align={'center'} gap={16} horizontal>
        <PluginAvatar identifier={id} size={56} />
        <Flexbox gap={4}>
          <div className={styles.title}>{pluginHelpers.getPluginTitle(pluginMeta)}</div>
          {(pluginMeta?.tags as string[])?.length > 0 && (
            <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
              {(pluginHelpers.getPluginTags(pluginMeta) as string[]).map((tag: string, index) => (
                <Tag key={index} style={{ margin: 0 }}>
                  {startCase(tag).trim()}
                </Tag>
              ))}
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
      {desc && (
        <>
          <Divider dashed style={{ margin: 0 }} />
          <div className={styles.desc}>{pluginHelpers.getPluginDesc(pluginMeta)}</div>
        </>
      )}
    </Block>
  );
});

export default Meta;
