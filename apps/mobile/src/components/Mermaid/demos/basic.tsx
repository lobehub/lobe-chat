import { Flexbox, Mermaid } from '@lobehub/ui-rn';

const codeExamples = `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
`;

export default () => {
  return (
    <Flexbox gap={16}>
      <Mermaid code={codeExamples} />
      <Mermaid code={codeExamples} fullFeatured />
    </Flexbox>
  );
};
