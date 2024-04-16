export type CDN = 'aliyun' | 'unpkg';
export interface CdnApi {
    path: string;
    pkg: string;
    proxy?: CDN;
    version?: string;
}
export declare const genCdnUrl: ({ pkg, version, path, proxy }: CdnApi) => string;
