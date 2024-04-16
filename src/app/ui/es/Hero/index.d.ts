/// <reference types="react" />
export interface HeroAction {
    /**
     * @description Icon name from LucideIcon package
     */
    icon?: string;
    /**
     * @description Link to be redirected to on button click
     */
    link: string;
    /**
     * @description Whether to open the link in a new tab
     * @default false
     */
    openExternal?: boolean;
    /**
     * @description Text to be displayed on the button
     */
    text: string;
    /**
     * @description Type of button
     * @default 'default'
     */
    type?: 'primary' | 'default';
}
export interface HeroProps {
    /**
     * @description Array of action buttons to be displayed
     * @default []
     */
    actions?: HeroAction[];
    /**
     * @description Short description to be displayed
     */
    description?: string;
    /**
     * @description Title to be displayed
     */
    title?: string;
}
declare const Hero: import("react").NamedExoticComponent<HeroProps>;
export default Hero;
