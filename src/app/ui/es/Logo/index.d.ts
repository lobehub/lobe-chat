import { type ReactNode } from 'react';
import { DivProps } from "../types";
export interface LogoProps extends DivProps {
    /**
     * @description Additional React Node to be rendered next to the logo
     */
    extra?: ReactNode;
    /**
     * @description Size of the logo in pixels
     * @default 32
     */
    size?: number;
    /**
     * @description Type of the logo to be rendered
     * @default '3d'
     */
    type?: '3d' | 'flat' | 'high-contrast' | 'text' | 'combine';
}
declare const Logo: import("react").NamedExoticComponent<LogoProps>;
export default Logo;
