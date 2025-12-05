import { Text } from '@lobehub/ui';
import type { PropsWithChildren, ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

export interface AuthCardProps extends PropsWithChildren {
  footer?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
}

export const AuthCard = ({ children, title, subtitle, footer }: AuthCardProps) => {
  return (
    <Flexbox width={'min(100%,400px)'}>
      <Flexbox gap={2}>
        {title && (
          <Text fontSize={28} weight={'bold'}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text fontSize={18} type={'secondary'} weight={500}>
            {subtitle}
          </Text>
        )}
      </Flexbox>
      <Flexbox gap={4} paddingBlock={32}>
        {children}
      </Flexbox>
      {footer}
    </Flexbox>
  );
};

export default AuthCard;
