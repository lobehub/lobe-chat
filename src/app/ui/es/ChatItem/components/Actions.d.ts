/// <reference types="react" />
import { ChatItemProps } from "..";
export interface ActionsProps {
    actions: ChatItemProps['actions'];
    editing?: boolean;
    placement?: ChatItemProps['placement'];
    type?: ChatItemProps['type'];
}
declare const Actions: import("react").NamedExoticComponent<ActionsProps>;
export default Actions;
