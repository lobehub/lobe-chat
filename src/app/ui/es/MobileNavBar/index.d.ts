import { CSSProperties, ReactNode } from 'react';
export interface MobileNavBarProps {
    center?: ReactNode;
    className?: string;
    classNames?: {
        center?: string;
        left?: string;
        right?: string;
    };
    contentStyles?: {
        center?: CSSProperties;
        left?: CSSProperties;
        right?: CSSProperties;
    };
    gap?: {
        center?: number;
        left?: number;
        right?: number;
    };
    left?: ReactNode;
    onBackClick?: () => void;
    right?: ReactNode;
    safeArea?: boolean;
    showBackButton?: boolean;
    style?: CSSProperties;
}
declare const MobileNavBar: import("react").NamedExoticComponent<MobileNavBarProps>;
export default MobileNavBar;
