import { Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useElectronStore } from '@/store/electron';
import { desktopStateSelectors } from '@/store/electron/selectors';

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    color: ${token.colorTextQuaternary};
  `,
  item: css`
    padding-block: 4px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;
    transition: all 0.2s ease;

    &:hover {
      background: ${token.colorFillQuaternary};
    }
  `,
  path: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    word-break: break-all;
  `,
}));

interface MoveFileItemProps {
  newPath: string;
  oldPath: string;
}

const MoveFileItem = memo<MoveFileItemProps>(({ oldPath, newPath }) => {
  const { styles } = useStyles();
  const displayOldPath = useElectronStore(desktopStateSelectors.displayRelativePath(oldPath));
  const displayNewPath = useElectronStore(desktopStateSelectors.displayRelativePath(newPath));

  return (
    <Flexbox align="center" className={styles.item} gap={8} horizontal width="100%">
      <Flexbox flex={1}>
        <Text className={styles.path} type="secondary">
          {displayOldPath}
        </Text>
      </Flexbox>
      <Icon className={styles.icon} icon={ArrowRight} />
      <Flexbox flex={2}>
        <Text className={styles.path}>{displayNewPath}</Text>
      </Flexbox>
    </Flexbox>
  );
});

export default MoveFileItem;
