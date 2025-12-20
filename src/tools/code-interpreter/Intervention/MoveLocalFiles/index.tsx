'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  path: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
}));

interface MoveLocalFilesParams {
  operations: Array<{ destination: string; source: string }>;
}

const MoveLocalFiles = memo<BuiltinInterventionProps<MoveLocalFilesParams>>(({ args }) => {
  const { styles } = useStyles();
  const { operations } = args;

  return (
    <Flexbox gap={8}>
      <Text>Move {operations.length} item(s):</Text>
      <Flexbox gap={4}>
        {operations.map((op, i) => (
          <Flexbox align={'center'} gap={8} horizontal key={i}>
            <Text className={styles.path} ellipsis style={{ maxWidth: 200 }}>{op.source}</Text>
            <ArrowRight size={12} />
            <Text className={styles.path} ellipsis style={{ maxWidth: 200 }}>{op.destination}</Text>
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default MoveLocalFiles;
