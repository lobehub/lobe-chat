import { Markdown } from '@lobehub/ui-rn';

const inlineCodeContent = `## Inline Code

Use \`backticks\` to create inline code within text.

The \`console.log()\` function prints to the console.

## Code in Lists

- Use \`npm start\` to run the development server
- Use \`npm test\` to run tests  
- Use \`npm build\` to build for production

## Code in Tables

| Command | Description |
| --- | --- |
| \`git status\` | Check repository status |
| \`git add .\` | Stage all changes |
| \`git commit\` | Commit changes |

## Multiple Code Snippets

Configure your \`package.json\`, run \`npm install\`, and start with \`npm start\`.
`;

export default () => {
  return <Markdown>{inlineCodeContent}</Markdown>;
};
