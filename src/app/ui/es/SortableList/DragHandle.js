import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style"];
import { GripVertical } from 'lucide-react';
import React, { memo, useContext, useState } from 'react';
import ActionIcon from "../ActionIcon";
import { SortableItemContext } from "./SortableItem";
import { jsx as _jsx } from "react/jsx-runtime";
var DragHandle = /*#__PURE__*/memo(function (_ref) {
  var style = _ref.style,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    grab = _useState2[0],
    setGrab = _useState2[1];
  var _useContext = useContext(SortableItemContext),
    attributes = _useContext.attributes,
    listeners = _useContext.listeners,
    ref = _useContext.ref;
  return /*#__PURE__*/_jsx(ActionIcon, _objectSpread(_objectSpread(_objectSpread(_objectSpread({
    "data-cypress": "draggable-handle",
    glass: true,
    icon: GripVertical,
    onMouseDown: function onMouseDown() {
      return setGrab(true);
    },
    onMouseUp: function onMouseUp() {
      return setGrab(false);
    },
    size: 'small',
    style: _objectSpread({
      cursor: grab ? 'grab' : 'grabbing'
    }, style)
  }, rest), attributes), listeners), {}, {
    ref: ref
  }));
});
export default DragHandle;