import { ChatInputActionBar } from '@lobehub/ui';
import { ReactNode, memo } from 'react';

import { ActionKeys, actionMap } from './config';

const RenderActionList = ({ dataSource }: { dataSource: ActionKeys[] }) => (
  <>
    {dataSource.map((key) => {
      const Render = actionMap[key];
      return <Render key={key} />;
    })}
  </>
);

export interface ActionBarProps {
  leftActions: ActionKeys[];
  leftAreaEndRender?: ReactNode;
  leftAreaStartRender?: ReactNode;
  padding?: number | string;
  rightActions: ActionKeys[];
  rightAreaEndRender?: ReactNode;
  rightAreaStartRender?: ReactNode;
}

const ActionBar = memo<ActionBarProps>(
  ({
    padding = '0 16px',
    rightAreaStartRender,
    rightAreaEndRender,
    leftAreaStartRender,
    leftAreaEndRender,
    leftActions,
    rightActions,
  }) => (
    <ChatInputActionBar
      leftAddons={
        <>
          {leftAreaStartRender}
          <RenderActionList dataSource={leftActions} />
          {leftAreaEndRender}
        </>
      }
      padding={padding}
      rightAddons={
        <>
          {rightAreaStartRender}
          <RenderActionList dataSource={rightActions} />
          {rightAreaEndRender}
        </>
      }
    />
  ),
);

export default ActionBar;
