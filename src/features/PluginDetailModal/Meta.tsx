import { Avatar, Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const useStyles = createStyles(({ css, token, stylish }) => ({
  avatar: css`
    flex: none;
  `,
  desc: css`
    color: ${token.colorTextDescription};
    text-align: center;
  `,
  markdown: stylish.markdownInChat,

  title: css`
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  `,
}));

const Meta = memo<{
  id: string;
}>(({ id }) => {
  const pluginMeta = useToolStore(pluginSelectors.getPluginMetaById(id), isEqual);
  const { styles, theme } = useStyles();

  return (
    <Center gap={16}>
      <Avatar
        animation
        avatar={pluginHelpers.getPluginAvatar(pluginMeta)}
        background={theme.colorFillTertiary}
        className={styles.avatar}
        size={100}
      />

      <div className={styles.title}>{pluginHelpers.getPluginTitle(pluginMeta)}</div>
      {(pluginMeta?.tags as string[])?.length > 0 && (
        <Center gap={6} horizontal style={{ flexWrap: 'wrap' }}>
          {(pluginHelpers.getPluginTags(pluginMeta) as string[]).map((tag: string, index) => (
            <Tag key={index} style={{ margin: 0 }}>
              {startCase(tag).trim()}
            </Tag>
          ))}
        </Center>
      )}
      <div className={styles.desc}>{pluginHelpers.getPluginDesc(pluginMeta)}</div>
    </Center>
  );
});

export default Meta;
