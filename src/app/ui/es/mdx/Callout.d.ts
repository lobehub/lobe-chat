import type { ReactNode } from 'react';
import { FC } from 'react';
export interface CalloutProps {
    children: ReactNode;
    type?: 'tip' | 'error' | 'important' | 'info' | 'warning';
}
declare const Callout: FC<CalloutProps>;
export default Callout;
