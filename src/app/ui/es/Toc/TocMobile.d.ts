/// <reference types="react" />
import { AnchorProps } from 'antd';
export interface AnchorItem {
    /**
     * @description The children of the anchor item
     */
    children?: AnchorItem[];
    /**
     * @description The ID of the anchor item
     */
    id: string;
    /**
     * @description The title of the anchor item
     */
    title: string;
}
export interface TocMobileProps {
    /**
     * @description The active key of the TocMobile component
     * @default undefined
     */
    activeKey?: string;
    /**
     * @description The function to get the container of the anchor
     */
    getContainer?: AnchorProps['getContainer'];
    /**
     * @description The height of the header
     * @default 64
     */
    headerHeight?: number;
    /**
     * @description The array of anchor items to be displayed
     */
    items: AnchorItem[];
    /**
     * @description The function to be called when the active key changes
     */
    onChange?: (activeKey: string) => void;
    /**
     * @description The width of the toc
     * @default 176
     */
    tocWidth?: number;
}
export declare const mapItems: (items: AnchorItem[]) => {
    children: {
        href: string;
        key: string;
        title: string;
    }[] | undefined;
    href: string;
    key: string;
    title: string;
}[];
declare const TocMobile: import("react").NamedExoticComponent<TocMobileProps>;
export default TocMobile;
