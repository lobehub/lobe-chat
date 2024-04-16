import { type ReactNode } from 'react';
import { type FlexboxProps } from 'react-layout-kit';
import DragHandle from './DragHandle';
import SortableItem from './SortableItem';
interface BaseItem {
    [key: string]: any;
    id: string | number;
}
export interface SortableListProps extends Omit<FlexboxProps, 'onChange'> {
    items: BaseItem[];
    onChange(items: BaseItem[]): void;
    renderItem(item: BaseItem): ReactNode;
}
export interface ISortableList {
    (props: SortableListProps): ReactNode;
    DragHandle: typeof DragHandle;
    Item: typeof SortableItem;
}
declare const SortableList: ISortableList;
export default SortableList;
