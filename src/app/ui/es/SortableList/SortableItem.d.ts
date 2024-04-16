/// <reference types="react" />
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { type FlexboxProps } from 'react-layout-kit';
interface Context {
    attributes: Record<string, any>;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
}
export declare const SortableItemContext: import("react").Context<Context>;
export interface SortableItemProps extends Omit<FlexboxProps, 'id'> {
    id: string | number;
}
declare const SortableItem: import("react").NamedExoticComponent<SortableItemProps>;
export default SortableItem;
