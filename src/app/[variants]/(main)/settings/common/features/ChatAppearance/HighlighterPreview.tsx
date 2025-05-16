import { Block, HighlighterProps } from '@lobehub/ui';
import { ChatItem } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';

const code = `
\`\`\`ts
const person = { name: "Alice", age: 30 };
type PersonType = typeof person;  // { name: string; age: number }

// 'satisfies' to ensure a type matches but allows more specific types
type Animal = { name: string };
const dog = { name: "Buddy", breed: "Golden Retriever" } satisfies Animal;
\`\`\`
`;

const HighlighterPreview = memo<{ theme?: HighlighterProps['theme'] }>(
  ({ theme }) => {
    const token = useTheme();

    return (
      <Block
        style={{
          background: token.colorBgContainerSecondary,
          marginBlock: 16,
          minHeight: 260,
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
              highlight: {
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

export default HighlighterPreview;
