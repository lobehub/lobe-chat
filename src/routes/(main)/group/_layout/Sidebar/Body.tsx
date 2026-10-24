import { AccordionRoot, Flexbox } from '@lobehub/ui';

import SidebarFavorites from '@/features/HomeSidebar/Body/Favorites';

import Members from './Members';
import Topic from './Topic';

export enum ChatSidebarKey {
  Favorites = 'favorites',
  Members = 'members',
  Topic = 'topic',
}

const Body = () => {
  return (
    <Flexbox paddingInline={4}>
      <AccordionRoot
        defaultValue={[ChatSidebarKey.Favorites, ChatSidebarKey.Members, ChatSidebarKey.Topic]}
        indicatorPlacement="inline"
        style={{ gap: 8 }}
      >
        <SidebarFavorites itemKey={ChatSidebarKey.Favorites} />
        <Members itemKey={ChatSidebarKey.Members} />
        <Topic itemKey={ChatSidebarKey.Topic} />
      </AccordionRoot>
    </Flexbox>
  );
};

export default Body;
