import { ChatInputActionBar } from '@lobehub/ui/chat';
import { memo } from 'react';

import { ActionKeys, actionMap } from '@/features/ChatInput/ActionBar/config';

const RenderActionList = ({ dataSource }: { dataSource: ActionKeys[] }) => (
  <>
    {dataSource.map((key) => {
      // @ts-ignore
      const Render = actionMap[key];
      return <Render key={key} />;
    })}
  </>
);

export interface ActionBarProps {
  leftActions: ActionKeys[];
  padding?: number | string;
  rightActions: ActionKeys[];
}

const ActionBar = memo<ActionBarProps>(({ padding = '0 8px', leftActions, rightActions }) => (
  <ChatInputActionBar
    leftAddons={<RenderActionList dataSource={leftActions} />}
    padding={padding}
    rightAddons={<RenderActionList dataSource={rightActions} />}
  />
));

export default ActionBar;
