import { CSSProperties, FC, PropsWithChildren } from 'react';
export interface TypographyProps extends PropsWithChildren {
    className?: string;
    fontSize?: number;
    headerMultiple?: number;
    lineHeight?: number;
    marginMultiple?: number;
    style?: CSSProperties;
}
export declare const Typography: FC<TypographyProps>;
