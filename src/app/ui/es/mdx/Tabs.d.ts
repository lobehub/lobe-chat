import { FC, ReactNode } from 'react';
export interface TabsProps {
    children: ReactNode[];
    defaultIndex?: number | string;
    items: string[];
}
declare const Tabs: FC<TabsProps>;
export default Tabs;
