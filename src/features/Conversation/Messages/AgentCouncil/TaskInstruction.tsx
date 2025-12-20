'use client';

import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    padding-block: 16px;
    padding-inline: 16px;
    border-radius: 8px;
    background: ${token.colorFillQuaternary};
  `,
}));

interface TaskInstructionProps {
  instruction: string;
}

const TaskInstruction = memo<TaskInstructionProps>(({ instruction }) => {
  const { styles } = useStyles();

  return (
    <Text className={styles.content} style={{ margin: 0 }}>
      {instruction}
    </Text>
  );
});

TaskInstruction.displayName = 'TaskInstruction';

export default TaskInstruction;
