/// <reference types="react" />
import { DivProps } from "../../types";
export interface SyntaxHighlighterProps extends DivProps {
    children: string;
    language: string;
}
declare const SyntaxHighlighter: import("react").NamedExoticComponent<SyntaxHighlighterProps>;
export default SyntaxHighlighter;
