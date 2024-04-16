import type { Target } from 'ahooks/lib/useScroll';
import { type BackTopProps } from 'antd';
import { type CSSProperties } from 'react';
export interface BackBottomProps {
    className?: string;
    onClick?: BackTopProps['onClick'];
    style?: CSSProperties;
    target: Target;
    text?: string;
    visibilityHeight?: BackTopProps['visibilityHeight'];
}
declare const BackBottom: import("react").NamedExoticComponent<BackBottomProps>;
export default BackBottom;
