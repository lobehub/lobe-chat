import { Markdown } from '@lobehub/ui-rn';

const alertsContent = `## GitHub Style Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

## Multiple Alerts

> [!NOTE]
> This is a note with **bold** and *italic* text.
> 
> It can have multiple paragraphs.

> [!TIP]
> You can include code: \`const x = 10\`
> 
> - And lists
> - With multiple items

> [!WARNING]
> **Important:** Be careful with this operation!
> 
> It cannot be undone.
`;

export default () => {
  return <Markdown>{alertsContent}</Markdown>;
};
