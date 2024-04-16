import { type FooterProps as RcProps } from 'rc-footer';
import { type ReactNode } from 'react';
export interface FooterProps {
    /**
     * @description The bottom content of the footer
     */
    bottom?: ReactNode;
    /**
     * @description The columns of the footer
     */
    columns: RcProps['columns'];
    /**
     * @description The maximum width of the content in the footer
     * @type number
     * @default 960
     */
    contentMaxWidth?: number;
    /**
     * @description The theme of the footer
     */
    theme?: 'light' | 'dark';
}
declare const Footer: import("react").NamedExoticComponent<FooterProps>;
export default Footer;
