import { ReactNode } from 'react';
import { type CopyButtonProps } from "../CopyButton";
import { DivProps } from "../types";
export interface HighlighterProps extends DivProps {
    allowChangeLanguage?: boolean;
    /**
     * @description The code content to be highlighted
     */
    children: string;
    copyButtonSize?: CopyButtonProps['size'];
    /**
     * @description Whether to show the copy button
     * @default true
     */
    copyable?: boolean;
    fileName?: string;
    fullFeatured?: boolean;
    icon?: ReactNode;
    /**
     * @description The language of the code content
     */
    language: string;
    /**
     * @description Whether to show language tag
     * @default true
     */
    showLanguage?: boolean;
    /**
     * @description Whether add spotlight background
     * @default false
     */
    spotlight?: boolean;
    /**
     * @description The type of the code block
     * @default 'block'
     */
    type?: 'ghost' | 'block' | 'pure';
}
export declare const Highlighter: import("react").NamedExoticComponent<HighlighterProps>;
export default Highlighter;
export { default as SyntaxHighlighter, type SyntaxHighlighterProps } from './SyntaxHighlighter';
