import { CSSProperties } from 'react';
import { type ImageProps } from "../mdx/Image";
import { type VideoProps } from "../mdx/Video";
import type { TypographyProps } from './Typography';
export interface MarkdownProps extends TypographyProps {
    allowHtml?: boolean;
    children: string;
    className?: string;
    componentProps?: {
        img?: ImageProps;
        pre?: any;
        video?: VideoProps;
    };
    enableImageGallery?: boolean;
    fullFeaturedCodeBlock?: boolean;
    onDoubleClick?: () => void;
    style?: CSSProperties;
    variant?: 'normal' | 'chat';
}
declare const Markdown: import("react").NamedExoticComponent<MarkdownProps>;
export default Markdown;
