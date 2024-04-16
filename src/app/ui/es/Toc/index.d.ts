/// <reference types="react" />
import { type TocMobileProps } from './TocMobile';
export interface TocProps extends TocMobileProps {
    /**
     * @description Whether the component is being rendered on a mobile device or not
     * @default false
     */
    isMobile?: boolean;
}
declare const Toc: import("react").NamedExoticComponent<TocProps>;
export default Toc;
