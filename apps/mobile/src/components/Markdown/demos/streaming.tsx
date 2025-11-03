import { Button, Flexbox, Markdown } from '@lobehub/ui-rn';
import { useEffect, useState } from 'react';

const fullContent = `# Streaming Markdown Demo

This demonstrates how markdown content can be streamed character by character.

## Features

- **Real-time rendering** - Content appears as it streams
- **Smooth animation** - Natural typing effect
- **Full markdown support** - All features work during streaming

## Code Example

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

## Math Formula

The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

Block formula:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

## Table

| Feature | Status |
| --- | --- |
| Streaming | ✅ |
| Markdown | ✅ |
| Math | ✅ |

Thank you for watching!
`;

export default () => {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const restartStreaming = () => {
    setStreamedContent('');
    setIsStreaming(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Simulate streaming effect
  useEffect(() => {
    if (!isStreaming || isPaused) return;

    let currentPosition = streamedContent.length;

    const intervalId = setInterval(() => {
      if (currentPosition < fullContent.length) {
        const nextChunkSize = Math.min(3, fullContent.length - currentPosition);
        const nextContent = fullContent.slice(0, currentPosition + nextChunkSize);
        setStreamedContent(nextContent);
        currentPosition += nextChunkSize;
      } else {
        clearInterval(intervalId);
        setIsStreaming(false);
      }
    }, 25);

    return () => clearInterval(intervalId);
  }, [isStreaming, isPaused, streamedContent.length]);

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8} horizontal>
        <Flexbox flex={1}>
          <Button loading={!isPaused && isStreaming} onPress={restartStreaming} type="primary">
            Restart Streaming
          </Button>
        </Flexbox>
        <Flexbox flex={1}>
          <Button
            disabled={!isStreaming}
            onPress={togglePause}
            type={isPaused ? 'default' : 'primary'}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </Flexbox>
      </Flexbox>
      <Markdown animated={isStreaming}>{streamedContent}</Markdown>
    </Flexbox>
  );
};
