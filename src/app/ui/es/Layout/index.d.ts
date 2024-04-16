import { ReactNode } from 'react';
import { DivProps } from "../types";
export interface LayoutHeaderProps extends DivProps {
    headerHeight?: number;
}
export declare const LayoutHeader: import("react").NamedExoticComponent<LayoutHeaderProps>;
export type LayoutMainProps = DivProps;
export declare const LayoutMain: import("react").NamedExoticComponent<DivProps>;
export interface LayoutSidebarProps extends DivProps {
    headerHeight?: number;
}
export declare const LayoutSidebar: import("react").NamedExoticComponent<LayoutSidebarProps>;
export interface LayoutSidebarInnerProps extends DivProps {
    headerHeight?: number;
}
export declare const LayoutSidebarInner: import("react").NamedExoticComponent<LayoutSidebarInnerProps>;
export interface LayoutTocProps extends DivProps {
    tocWidth?: number;
}
export declare const LayoutToc: import("react").NamedExoticComponent<LayoutTocProps>;
export type LayoutFooterProps = DivProps;
export declare const LayoutFooter: import("react").NamedExoticComponent<DivProps>;
export interface LayoutProps {
    /**
     * @description Width of the sidebar
     */
    asideWidth?: number;
    /**
     * @description Children of the layout
     */
    children?: ReactNode;
    /**
     * @description Content of the layout
     */
    content?: ReactNode;
    /**
     * @description Footer of the layout
     */
    footer?: ReactNode;
    /**
     * @description Header of the layout
     */
    header?: ReactNode;
    /**
     * @description Height of the header
     * @default 64
     */
    headerHeight?: number;
    /**
     * @description Helmet of the layout
     */
    helmet?: ReactNode;
    /**
     * @description Sidebar of the layout
     */
    sidebar?: ReactNode;
    /**
     * @description Table of contents of the layout
     */
    toc?: ReactNode;
    /**
     * @description Width of the table of contents
     */
    tocWidth?: number;
}
declare const Layout: import("react").NamedExoticComponent<LayoutProps>;
export default Layout;
