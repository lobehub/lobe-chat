import { Markdown } from '@lobehub/ui-rn';

const codeBlocksContent = `## JavaScript Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## TypeScript Code Block

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = async (id: number): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};
\`\`\`

## Python Code Block

\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Print first 10 Fibonacci numbers
for i in range(10):
    print(calculate_fibonacci(i))
\`\`\`

## JSON Code Block

\`\`\`json
{
  "name": "lobe-chat",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-native": "^0.72.0"
  }
}
\`\`\`
`;

export default () => {
  return <Markdown>{codeBlocksContent}</Markdown>;
};
