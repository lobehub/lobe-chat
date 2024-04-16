import { ElementType, ReactNode } from 'react';
import { CDN, CdnApi } from "../utils/genCdnUrl";
type CdnFn = ({ pkg, version, path }: CdnApi) => string;
export interface Config {
    aAs?: ElementType;
    customCdnFn?: CdnFn;
    imgAs?: ElementType;
    imgUnoptimized?: boolean;
    proxy?: CDN | 'custom';
}
export declare const ConfigContext: import("react").Context<Config | null>;
declare const ConfigProvider: import("react").NamedExoticComponent<{
    children: ReactNode;
    config: Config;
}>;
export declare const useCdnFn: () => CdnFn;
export default ConfigProvider;
