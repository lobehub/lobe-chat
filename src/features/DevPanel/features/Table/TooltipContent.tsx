import { Highlighter } from '@lobehub/ui';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const TooltipContent = memo<{ children: ReactNode }>(({ children }) => {
  if (typeof children !== 'string') return children;

  if (children.startsWith('data:image')) {
    return (
      <Image
        alt={'tooltip-image'}
        src={children}
        style={{ height: 'auto', maxWidth: '100%' }}
        unoptimized
      />
    );
  }

  if (children.startsWith('http'))
    return (
      <Link href={children} target={'_blank'}>
        {children}
      </Link>
    );

  const code = children.trim().trimEnd();

  if ((code.startsWith('{') && code.endsWith('}')) || (code.startsWith('[') && code.endsWith(']')))
    return (
      <Highlighter
        language={'json'}
        style={{
          maxHeight: 400,
          overflow: 'auto',
        }}
        type={'pure'}
      >
        {JSON.stringify(JSON.parse(code), null, 2)}
      </Highlighter>
    );

  return <Flexbox>{children}</Flexbox>;
});

export default TooltipContent;
