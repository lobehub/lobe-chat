import type { ReactNode } from 'react';

export interface TabViewProps {
  defaultValue?: string;
  items: { children: ReactNode; key: string; lazy?: boolean }[];
  lazy?: boolean;
  onChange?: (value: string) => void;
  value?: string;
}
