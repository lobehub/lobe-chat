import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { memo } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
var dropAnimationConfig = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4'
      }
    }
  })
};
var SortableOverlay = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children;
  return /*#__PURE__*/_jsx(DragOverlay, {
    dropAnimation: dropAnimationConfig,
    children: children
  });
});
export default SortableOverlay;