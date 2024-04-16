/// <reference types="react" />
declare const mdxComponents: {
    Callout: import("react").FC<import("./Callout").CalloutProps>;
    Card: import("react").FC<import("./Card").CardProps>;
    Cards: import("react").FC<import("./Cards").CardsProps>;
    FileTree: import("./FileTree").FileTreeProps;
    Image: import("react").FC<import("./Image").ImageProps>;
    Steps: import("react").FC<{
        children?: import("react").ReactNode;
    }>;
    Tab: import("react").FC<import("./Tab").TabProps>;
    Tabs: import("react").FC<import("./Tabs").TabsProps>;
    Video: import("react").FC<import("./Video").VideoProps>;
};
export default mdxComponents;
