/// <reference types="react" />
import { ChatItemProps } from "..";
export interface LoadingProps {
    loading?: ChatItemProps['loading'];
    placement?: ChatItemProps['placement'];
}
declare const Loading: import("react").NamedExoticComponent<LoadingProps>;
export default Loading;
