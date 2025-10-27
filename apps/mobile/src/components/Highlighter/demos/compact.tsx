import { Flexbox, Highlighter, Text } from '@lobehub/ui-rn';

const compactExamples = [
  {
    description: '适合展示终端命令和脚本',
    items: [
      { code: 'npm install react-native', lang: 'bash' },
      { code: 'yarn add @types/react-native', lang: 'bash' },
      { code: 'npx react-native init MyApp', lang: 'bash' },
    ],
    title: '命令行指令',
  },
  {
    description: '短小的代码示例',
    items: [
      { code: 'const [state, setState] = useState(0);', lang: 'javascript' },
      { code: 'interface Props { title: string; }', lang: 'typescript' },
      { code: 'export default function App() {}', lang: 'typescript' },
    ],
    title: '代码片段',
  },
];

export default () => {
  return (
    <Flexbox gap={24}>
      {compactExamples.map((section, sectionIndex) => (
        <Flexbox gap={12} key={sectionIndex}>
          <Text as="h4" strong>
            {section.title}
          </Text>
          <Text type="secondary">{section.description}</Text>
          <Flexbox gap={8}>
            {section.items.map((item, itemIndex) => (
              <Highlighter code={item.code} copyable key={itemIndex} lang={item.lang} />
            ))}
          </Flexbox>
        </Flexbox>
      ))}
    </Flexbox>
  );
};
