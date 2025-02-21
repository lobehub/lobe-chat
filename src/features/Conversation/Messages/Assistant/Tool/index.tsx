import { AnimatePresence, motion } from 'framer-motion';
import { CSSProperties, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Inspectors from './Inspector';
import Render from './Render';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  style?: CSSProperties;
}

const Tool = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, id, index, identifier, style, payload }) => {
    const [showRender, setShowRender] = useState(true);
    const [showPluginRender, setShowPluginRender] = useState(false);

    return (
      <Flexbox gap={8} style={style}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          id={id}
          identifier={identifier}
          index={index}
          messageId={messageId}
          payload={payload}
          setShowPluginRender={setShowPluginRender}
          setShowRender={setShowRender}
          showPluginRender={showPluginRender}
          showRender={showRender}
        />
        <AnimatePresence initial={false}>
          {showRender && (
            <motion.div
              animate="open"
              exit="collapsed"
              initial="collapsed"
              transition={{
                duration: 0.1,
                ease: [0.4, 0, 0.2, 1], // 使用 ease-out 缓动函数
              }}
              variants={{
                collapsed: { height: 0, opacity: 0, width: 0 },
                open: { height: 'auto', opacity: 1, width: 'auto' },
              }}
            >
              <Render
                messageId={messageId}
                requestArgs={requestArgs}
                setShowPluginRender={setShowPluginRender}
                showPluginRender={showPluginRender}
                toolCallId={id}
                toolIndex={index}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Flexbox>
    );
  },
);

export default Tool;
