import { type GiscusProps as GiscusComponentProps } from '@giscus/react';
import { CSSProperties } from 'react';
export interface GiscusProps extends GiscusComponentProps {
    className?: string;
    style?: CSSProperties;
}
declare const Giscus: import("react").NamedExoticComponent<GiscusProps>;
export default Giscus;
