import { Image } from 'antd';
import { memo } from 'react';
import usePreview from "./usePreview";
import { jsx as _jsx } from "react/jsx-runtime";
var PreviewGroup = Image.PreviewGroup;
var ImageGallery = /*#__PURE__*/memo(function (_ref) {
  var items = _ref.items,
    children = _ref.children,
    _ref$enable = _ref.enable,
    enable = _ref$enable === void 0 ? true : _ref$enable,
    preview = _ref.preview;
  var mergePreivew = usePreview(preview);
  if (!enable) return children;
  return /*#__PURE__*/_jsx(PreviewGroup, {
    items: items,
    preview: mergePreivew,
    children: children
  });
});
export default ImageGallery;