import { Flexbox, Highlighter, Text } from '@lobehub/ui-rn';

const codeExamples = [
  {
    code: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

const user = 'React Native';
greet(user);`,
    lang: 'javascript',
    title: 'JavaScript 基础语法',
  },
  {
    code: `interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

const createUser = (data: Partial<User>): User => {
  return {
    id: Date.now(),
    isActive: true,
    ...data
  } as User;
};`,
    lang: 'typescript',
    title: 'TypeScript 接口定义',
  },
  {
    code: `.container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 100%
  );
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12px;
}`,
    lang: 'css',
    title: 'CSS 样式规则',
  },
];

export default () => {
  return (
    <Flexbox gap={24}>
      {codeExamples.map((example, index) => (
        <Flexbox gap={8} key={index}>
          <Text as="h4" strong>
            {example.title}
          </Text>
          <Highlighter code={example.code} lang={example.lang} />
        </Flexbox>
      ))}
    </Flexbox>
  );
};
