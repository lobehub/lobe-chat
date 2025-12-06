'use client';

import { Text } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

export interface AuthCardProps extends Omit<FlexboxProps, 'title'> {
  footer?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
}

export const AuthCard = memo<AuthCardProps>(({ children, title, subtitle, footer, ...rest }) => {
  return (
    <Flexbox width={'min(100%,400px)'} {...rest}>
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
});

export default AuthCard;
