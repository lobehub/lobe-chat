import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { ChatFileItem } from '@/types/message';
import { formatSize } from '@/utils/format';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    overflow: hidden;

    max-width: 420px;
    padding-block: 8px;
    padding-inline: 12px;

    background: ${token.colorFillTertiary};
    border-radius: 8px;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
}));

const ArtifactItem = memo<ChatFileItem>(({ name, fileType, size }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      gap={8}
      horizontal
      // onClick={() => {
      //   if (!isToolHasUI || !identifier) return;
      //
      //   openToolUI(messageId, identifier);
      // }}
    >
      <FileIcon fileName={name} fileType={fileType} />
      <Flexbox>
        <Typography.Text ellipsis={{ tooltip: true }}>{name}</Typography.Text>
        <Typography.Text type={'secondary'}>{formatSize(size)}</Typography.Text>
      </Flexbox>
    </Flexbox>
  );
});

export default ArtifactItem;
