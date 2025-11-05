// Stub file for compatibility
// Discover features were removed in Serenvale Phase 1
import { PropsWithChildren, ReactNode } from 'react';

export interface TitleProps extends PropsWithChildren {
  icon?: ReactNode;
  id?: string;
  level?: number;
  more?: string;
  moreLink?: string;
  tag?: ReactNode;
}

const Title = ({ children }: TitleProps) => {
  return <h2>{children}</h2>;
};

export default Title;
