import { Block, MermaidProps } from '@lobehub/ui';
import { ChatItem } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';

const code = `\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
\`\`\`
`;

const MermaidPreview = memo<{ theme?: MermaidProps['theme'] }>(
  ({ theme }) => {
    const token = useTheme();
    return (
      <Block
        style={{
          background: token.colorBgContainerSecondary,
          marginBlock: 16,
          minHeight: 320,
          paddingBottom: 16,
        }}
        variant={'outlined'}
      >
        <ChatItem
          avatar={{
            avatar: DEFAULT_INBOX_AVATAR,
          }}
          markdownProps={{
            componentProps: {
              mermaid: {
                fullFeatured: false,
                theme,
              },
            },
          }}
          message={code}
        />
      </Block>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.theme === nextProps.theme;
  },
);

export default MermaidPreview;
