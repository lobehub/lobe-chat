"use client";

import { useEffect } from "react";
import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";

const AntdV5MonkeyPatch = () => {
  useEffect(() => {
    unstableSetRender((node, container) => {
      const root = createRoot(container);
      root.render(node);
      return async () => {
        root.unmount();
      };
    });
  }, []);
  return null;
};

export default AntdV5MonkeyPatch;
