import { CSSProperties, FC, ReactNode } from 'react';
export interface PreProps {
    allowChangeLanguage?: boolean;
    children: string;
    className?: string;
    fileName?: string;
    fullFeatured?: boolean;
    icon?: ReactNode;
    lang: string;
    style?: CSSProperties;
}
export declare const Pre: FC<PreProps>;
export declare const PreSingleLine: FC<Omit<PreProps, 'fullFeatured'>>;
export default Pre;
