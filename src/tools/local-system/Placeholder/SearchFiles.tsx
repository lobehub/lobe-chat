import { LocalSearchFilesParams } from '@lobechat/electron-client-ipc';
import { Icon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { SearchIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, cx }) => ({
  query: cx(css`
    padding-block: 4px;
    padding-inline: 8px;
    border-radius: 8px;

    font-size: 12px;
    color: ${token.colorTextSecondary};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `),
}));

interface SearchFilesProps {
  args: LocalSearchFilesParams;
}

const SearchFiles = memo<SearchFilesProps>(({ args }) => {
  const { styles } = useStyles();

  return (
    <Flexbox gap={8}>
      <Flexbox align={'center'} distribution={'space-between'} gap={40} height={32} horizontal>
        <Flexbox align={'center'} className={styles.query} gap={8} horizontal>
          <Icon icon={SearchIcon} />
          {args.keywords ? (
            args.keywords
          ) : (
            <Skeleton.Node active style={{ height: 20, width: 40 }} />
          )}
        </Flexbox>

        <Skeleton.Node active style={{ height: 20, width: 40 }} />
      </Flexbox>
      <Flexbox gap={4}>
        <Skeleton.Button active block style={{ height: 16 }} />
        <Skeleton.Button active block style={{ height: 16 }} />
        <Skeleton.Button active block style={{ height: 16 }} />
        <Skeleton.Button active block style={{ height: 16 }} />
      </Flexbox>
    </Flexbox>
  );
});

export default SearchFiles;
