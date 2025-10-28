import { Mermaid } from '@lobehub/ui-rn';

const codeExamples = `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
`;

export default () => {
  return <Mermaid code={codeExamples} />;
};
