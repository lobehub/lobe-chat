import { Markdown } from '@lobehub/ui-rn';

const tablesContent = `## Simple Table

| Feature | Status |
| --- | --- |
| Markdown | ✅ |
| Syntax Highlighting | ✅ |
| Math | ✅ |

## Aligned Columns

| Left aligned | Center aligned | Right aligned |
| :--- | :---: | ---: |
| Left | Center | Right |
| A | B | C |

## Table with Code

| Command | Description |
| --- | --- |
| \`npm start\` | Start development server |
| \`npm test\` | Run tests |
| \`npm build\` | Build for production |

## Complex Table

| Feature | Support | Platform | Notes |
| --- | --- | --- | --- |
| **Text Formatting** | ✅ | All | Bold, italic, etc |
| **Code Blocks** | ✅ | All | Syntax highlighting |
| **Math** | ✅ | All | LaTeX support |
| **Tables** | ✅ | All | GitHub flavored |
`;

export default () => {
  return <Markdown>{tablesContent}</Markdown>;
};
