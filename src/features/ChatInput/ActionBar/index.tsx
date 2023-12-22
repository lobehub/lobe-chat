import { ChatInputActionBar } from '@lobehub/ui';
import { ReactNode, memo, useMemo } from 'react';

import { ActionKeys, actionMap, getLeftActionList, getRightActionList } from './config';

const RenderActionList = ({ dataSource }: { dataSource: ActionKeys[] }) => (
  <>
    {dataSource.map((key) => {
      const Render = actionMap[key];
      return <Render key={key} />;
    })}
  </>
);

export interface ActionBarProps {
  leftAreaEndRender?: ReactNode;
  leftAreaStartRender?: ReactNode;
  mobile?: boolean;
  padding?: number | string;
  rightAreaEndRender?: ReactNode;
  rightAreaStartRender?: ReactNode;
}

const ActionBar = memo<ActionBarProps>(
  ({
    padding = '0 16px',
    mobile,
    rightAreaStartRender,
    rightAreaEndRender,
    leftAreaStartRender,
    leftAreaEndRender,
  }) => {
    const leftActionList = useMemo(() => getLeftActionList(mobile), [mobile]);
    const rightActionList = useMemo(() => getRightActionList(mobile), [mobile]);

    return (
      <ChatInputActionBar
        leftAddons={
          <>
            {leftAreaStartRender}
            <RenderActionList dataSource={leftActionList} />
            {leftAreaEndRender}
          </>
        }
        padding={padding}
        rightAddons={
          <>
            {rightAreaStartRender}
            <RenderActionList dataSource={rightActionList} />
            {rightAreaEndRender}
          </>
        }
      />
    );
  },
);

export default ActionBar;
