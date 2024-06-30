import isEqual from 'fast-deep-equal';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatDockSelectors, chatSelectors } from '@/store/chat/selectors';
import { BuiltinToolsDocks } from '@/tools/docks';
import { safeParseJSON } from '@/utils/safeParseJSON';

import Footer from './Footer';

const ToolUI = () => {
  const messageId = useChatStore(chatDockSelectors.toolUIMessageId);
  const message = useChatStore(chatSelectors.getMessageById(messageId || ''), isEqual);

  // make sure the message and id is valid
  if (!messageId || !message) return;

  const { plugin, pluginState } = message;

  // make sure the plugin and identifier is valid
  if (!plugin || !plugin.identifier) return;

  const args = safeParseJSON(plugin.arguments);

  if (!args) return;

  const Render = BuiltinToolsDocks[plugin.identifier];

  if (!Render) return;

  return (
    <>
      <Flexbox height={'100%'} paddingInline={12}>
        <Render
          arguments={args}
          identifier={plugin.identifier}
          messageId={messageId}
          state={pluginState}
        />
      </Flexbox>
      <Footer />
    </>
  );
};

export default ToolUI;
