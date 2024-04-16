import { ReactNode } from 'react';
import { DivProps } from "../types";
export interface SideNavProps extends DivProps {
    /**
     * @description Avatar to be displayed at the top of the sidenav
     */
    avatar?: ReactNode;
    /**
     * @description Actions to be displayed at the bottom of the sidenav
     */
    bottomActions: ReactNode;
    /**
     * @description Actions to be displayed below the avatar
     */
    topActions?: ReactNode;
}
declare const SideNav: import("react").NamedExoticComponent<SideNavProps>;
export default SideNav;
