import { Markdown } from '@lobehub/ui-rn';

const mermaidContent = `## Flowchart

\`\`\`mermaid
graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B
  C --> E[End]
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
  participant User
  participant App
  participant Server
  
  User->>App: Open app
  App->>Server: Request data
  Server-->>App: Return data
  App-->>User: Display data
\`\`\`

## Class Diagram

\`\`\`mermaid
classDiagram
  class Animal {
    +String name
    +int age
    +makeSound()
  }
  class Dog {
    +String breed
    +bark()
  }
  class Cat {
    +Boolean indoor
    +meow()
  }
  Animal <|-- Dog
  Animal <|-- Cat
\`\`\`
`;

export default () => {
  return <Markdown>{mermaidContent}</Markdown>;
};
