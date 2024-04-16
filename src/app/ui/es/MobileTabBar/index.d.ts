import { CSSProperties, ReactNode } from 'react';
export interface MobileTabBarItemProps {
    icon: ReactNode | ((active: boolean) => ReactNode);
    key: string;
    onClick?: () => void;
    title: ReactNode | ((active: boolean) => ReactNode);
}
export interface MobileTabBarProps {
    activeKey?: string;
    className?: string;
    defaultActiveKey?: string;
    items: MobileTabBarItemProps[];
    onChange?: (key: string) => void;
    safeArea?: boolean;
    style?: CSSProperties;
}
declare const MobileTabBar: import("react").NamedExoticComponent<MobileTabBarProps>;
export default MobileTabBar;
