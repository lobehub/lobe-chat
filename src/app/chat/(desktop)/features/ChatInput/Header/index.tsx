import { ActionIcon } from '@lobehub/ui';
import { Maximize2, Minimize2 } from 'lucide-react';
import { memo } from 'react';

import ActionBar from '@/features/ChatInput/ActionBar';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import DragUpload from './DragUpload';

const Header = memo<{ expand: boolean; setExpand: (expand: boolean) => void }>(
  ({ expand, setExpand }) => {
    const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);

    return (
      <>
        {canUpload && <DragUpload />}
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
      </>
    );
  },
);

export default Header;
