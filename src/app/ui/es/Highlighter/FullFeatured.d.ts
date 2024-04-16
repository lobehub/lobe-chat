import { ReactNode } from 'react';
import { DivProps } from "../types";
export interface HighlighterProps extends DivProps {
    allowChangeLanguage?: boolean;
    /**
     * @description The code content to be highlighted
     */
    children: string;
    fileName?: string;
    icon?: ReactNode;
    /**
     * @description The language of the code content
     */
    language: string;
}
export declare const Highlighter: import("react").NamedExoticComponent<HighlighterProps>;
export default Highlighter;
export { default as SyntaxHighlighter, type SyntaxHighlighterProps } from './SyntaxHighlighter';
