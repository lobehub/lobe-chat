/// <reference types="react" />
declare const List: {
    Item: import("react").ForwardRefExoticComponent<import("./ListItem").ListItemProps & import("react").HTMLAttributes<any> & import("react").RefAttributes<HTMLDivElement>>;
};
export type { ListItemProps } from './ListItem';
export default List;
