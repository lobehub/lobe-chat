import MobileContentLayout from '@/components/server/MobileNavLayout';

import { LayoutProps } from '../type';
import ChatHeader from './ChatHeader';
import TopicModal from './TopicModal';

const Layout = ({ children, topic, conversation }: LayoutProps) => {
  return (
    <MobileContentLayout header={<ChatHeader />}>
      {conversation}
      {children}
      <TopicModal>{topic}</TopicModal>
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileConversationLayout';

export default Layout;
