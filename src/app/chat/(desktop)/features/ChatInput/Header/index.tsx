import { ActionIcon } from '@lobehub/ui';
import { Maximize2, Minimize2 } from 'lucide-react';
import { memo } from 'react';

import ActionBar from '@/features/ChatInput/ActionBar';

interface HeaderProps {
  expand: boolean;
  setExpand: (expand: boolean) => void;
}

const Header = memo<HeaderProps>(({ expand, setExpand }) => (
  <ActionBar
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
