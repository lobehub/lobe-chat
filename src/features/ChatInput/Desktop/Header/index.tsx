import { ActionIcon } from '@lobehub/ui';
import { Maximize2, Minimize2 } from 'lucide-react';
import { memo } from 'react';

import ActionBar from '@/features/ChatInput/ActionBar';
import { ActionKeys } from '@/features/ChatInput/types';

interface HeaderProps {
  expand: boolean;
  leftActions: ActionKeys[];
  rightActions: ActionKeys[];
  setExpand: (expand: boolean) => void;
}

const Header = memo<HeaderProps>(({ expand, setExpand, leftActions, rightActions }) => (
  <ActionBar
    leftActions={leftActions}
    rightActions={rightActions}
    rightAreaEndRender={
      <ActionIcon
        icon={expand ? Minimize2 : Maximize2}
        onClick={() => {
          setExpand(!expand);
        }}
      />
    }
  />
));

export default Header;
