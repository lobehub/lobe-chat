import { Markdown } from '@lobehub/ui-rn';

const listsContent = `## Unordered Lists

- First item
- Second item
- Third item
  - Nested item 1
  - Nested item 2
    - Deep nested item

## Ordered Lists

1. First item
2. Second item
3. Third item
   1. Nested item 1
   2. Nested item 2

## Mixed Lists

1. First ordered item
   - Nested unordered
   - Another nested
2. Second ordered item
   1. Nested ordered
   2. Another nested ordered
`;

export default () => {
  return <Markdown>{listsContent}</Markdown>;
};
