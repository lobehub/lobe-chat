import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense, memo } from 'react';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import ActionLeft from './ActionLeft';
import ActionsRight from './ActionRight';

const Token = dynamic(() => import('./Token'), { ssr: false });

const useStyles = createStyles(({ css }) => {
  return {
    actionLeft: css`
      display: flex;
      flex: 1;
      gap: 4px;
      align-items: center;
      justify-content: flex-start;
    `,
    actionsBar: css`
      display: flex;
      flex: none;
      align-items: center;
      justify-content: space-between;

      padding: 0 16px;
    `,
    actionsRight: css`
      display: flex;
      flex: 0;
      gap: 4px;
      align-items: center;
      justify-content: flex-end;
    `,
  };
});

export interface ActionProps {
  rightExtra?: ReactNode;
}

const ActionBar = memo<ActionProps>(({ rightExtra }) => {
  const { styles } = useStyles();

  const [showTokenTag] = useSessionStore((s) => [agentSelectors.showTokenTag(s)]);

  return (
    <div className={styles.actionsBar}>
      <div className={styles.actionLeft}>
        <ActionLeft />
        {showTokenTag && (
          <Suspense>
            <Token />
          </Suspense>
        )}
      </div>
      <div className={styles.actionsRight}>
        <ActionsRight />
        {rightExtra}
      </div>
    </div>
  );
});

export default ActionBar;
