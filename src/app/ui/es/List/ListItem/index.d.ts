import { CSSProperties, HTMLAttributes, ReactNode } from 'react';
/**
 * 卡片列表项的属性
 */
export interface ListItemProps {
    /**
     * 渲染操作区域的 React 节点
     */
    actions?: ReactNode;
    /**
     * 是否处于激活状态
     */
    active: boolean;
    addon?: ReactNode;
    /**
     * 头像的 React 节点
     */
    avatar?: ReactNode;
    /**
     * 自定义样式类名
     */
    className?: string;
    /**
     * 自定义样式类名对象
     * @property time - 时间的样式类名
     */
    classNames?: {
        time?: string;
    };
    /**
     * 日期时间戳
     */
    date?: number;
    /**
     * 描述信息
     */
    description?: ReactNode;
    /**
     * 是否处于加载状态
     */
    loading?: boolean;
    /**
     * 点击事件回调函数
     */
    onClick?: () => void;
    /**
     * 鼠标悬停状态变化事件回调函数
     * @param hover - 是否悬停
     */
    onHoverChange?: (hover: boolean) => void;
    pin?: boolean;
    /**
     * 是否显示操作区域
     */
    showAction?: boolean;
    /**
     * 自定义样式对象
     */
    style?: CSSProperties;
    /**
     * 标题
     */
    title: ReactNode;
}
declare const ListItem: import("react").ForwardRefExoticComponent<ListItemProps & HTMLAttributes<any> & import("react").RefAttributes<HTMLDivElement>>;
export default ListItem;
