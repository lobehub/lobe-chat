import isEqual from 'fast-deep-equal';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';
import { safeParseJSON } from '@/utils/safeParseJSON';

import Footer from '../Footer';
import ToolRender from './ToolRender';

const ToolUI = () => {
  const messageId = useChatStore(chatPortalSelectors.artifactMessageId);
  const message = useChatStore(chatSelectors.getMessageById(messageId || ''), isEqual);

  // make sure the message and id is valid
  if (!messageId || !message) return;

  const { plugin } = message;

  // make sure the plugin and identifier is valid
  if (!plugin || !plugin.identifier) return;

  const args = safeParseJSON(plugin.arguments);

  if (!args) return;

  return (
    <>
      <Flexbox flex={1} height={'100%'} paddingInline={12}>
        <ToolRender />
      </Flexbox>
      <Footer />
    </>
  );
};

export default ToolUI;
