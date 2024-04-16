import { memo, useEffect, useRef } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
var Preview = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    visible = _ref.visible;
  var ref = useRef();
  useEffect(function () {
    var handleDisableZoom = function handleDisableZoom(event) {
      event.preventDefault();
    };
    if (visible) {
      ref.current.addEventListener('wheel', handleDisableZoom, {
        passive: false
      });
    } else {
      ref.current.removeEventListener('wheel', handleDisableZoom);
    }
  }, [visible]);
  return /*#__PURE__*/_jsx("div", {
    ref: ref,
    children: children
  });
});
export default Preview;