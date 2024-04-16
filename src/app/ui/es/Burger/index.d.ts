import { type DrawerProps, type MenuProps } from 'antd';
import { CSSProperties } from 'react';
import { type ActionIconProps } from "../ActionIcon";
export interface BurgerProps {
    className?: string;
    drawerProps?: Partial<Omit<DrawerProps, 'items' | 'opened' | 'setOpened'>>;
    fullscreen?: boolean;
    /**
     * @description The height of the header component
     * @default 64
     */
    headerHeight?: number;
    iconProps?: Partial<ActionIconProps>;
    /**
     * @description The items to be displayed in the menu
     */
    items: MenuProps['items'];
    onClick?: MenuProps['onClick'];
    /**
     * @description The keys of the currently open sub-menus
     */
    openKeys?: MenuProps['openKeys'];
    /**
     * @description Whether the menu is currently open or not
     */
    opened: boolean;
    rootClassName?: string;
    /**
     * @description The keys of the currently selected menu items
     */
    selectedKeys?: MenuProps['selectedKeys'];
    /**
     * @description A callback function to set the opened state
     */
    setOpened: (state: boolean) => void;
    style?: CSSProperties;
}
declare const Burger: import("react").NamedExoticComponent<BurgerProps>;
export default Burger;
