import { createStyles } from 'antd-style';
import React from 'react';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { localFileService } from '@/services/electron/localFileService';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    padding-block: 2px;
    padding-inline: 4px 8px;
    border-radius: 4px;

    color: ${token.colorTextSecondary};

    :hover {
      color: ${token.colorText};
      background: ${token.colorFillTertiary};
    }
  `,
  title: css`
    overflow: hidden;
    display: block;

    line-height: 20px;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

const LocalFile = ({
  name,
  path,
  isDirectory,
}: {
  isDirectory: boolean;
  name: string;
  path: string;
}) => {
  const { styles } = useStyles();
  const handleClick = () => {
    localFileService.openLocalFileOrFolder(path, isDirectory);
  };

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      gap={4}
      horizontal
      onClick={handleClick}
      style={{ display: 'inline-flex', verticalAlign: 'middle' }}
    >
      <FileIcon fileName={name} isDirectory={isDirectory} size={22} variant={'pure'} />
      <Flexbox align={'baseline'} gap={4} horizontal style={{ overflow: 'hidden', width: '100%' }}>
        <div className={styles.title}>{name}</div>
      </Flexbox>
    </Flexbox>
  );
};

export default LocalFile;
