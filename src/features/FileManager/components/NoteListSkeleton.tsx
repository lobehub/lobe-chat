import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  skeletonCard: css`
    margin: 12px;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
  `,
}));

const NoteListSkeleton = () => {
  const { styles } = useStyles();

  return (
    <Flexbox>
      {Array.from({ length: 5 }).map((_, index) => (
        <div className={styles.skeletonCard} key={index}>
          <Flexbox gap={12}>
            {/* Preview content skeleton */}
            <Skeleton.Button active block style={{ height: 120 }} />
            {/* Actions skeleton */}
            <Flexbox align={'flex-end'} justify={'flex-end'}>
              <Skeleton.Avatar active size={24} />
            </Flexbox>
          </Flexbox>
        </div>
      ))}
    </Flexbox>
  );
};

export default NoteListSkeleton;
