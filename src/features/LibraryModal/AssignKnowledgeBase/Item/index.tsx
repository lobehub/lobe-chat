import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import KnowledgeIcon from '@/components/KnowledgeIcon';
import { KnowledgeItem } from '@/types/knowledgeBase';

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
    line-height: 1;
  `,
}));

const PluginItem = memo<KnowledgeItem>(({ id, fileType, name, type, description, enabled }) => {
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
        <KnowledgeIcon fileType={fileType} name={name} size={{ file: 40, repo: 40 }} type={type} />
        <Flexbox flex={1} gap={4} style={{ overflow: 'hidden', position: 'relative' }}>
          <Flexbox align={'center'} gap={8} horizontal>
            <Text className={styles.title} ellipsis>
              {name}
            </Text>
          </Flexbox>
          {description && (
            <Text className={styles.desc} ellipsis>
              {description}
            </Text>
          )}
        </Flexbox>
      </Flexbox>
      <Actions enabled={enabled} id={id} type={type} />
    </Flexbox>
  );
});

export default PluginItem;
