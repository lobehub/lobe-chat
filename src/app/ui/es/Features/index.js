'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["items", "className", "itemClassName", "itemStyle", "maxWidth", "style"];
import { memo } from 'react';
import SpotlightCard from "../SpotlightCard";
import { default as Item } from "./Item";
import { jsx as _jsx } from "react/jsx-runtime";
var Features = /*#__PURE__*/memo(function (_ref) {
  var items = _ref.items,
    className = _ref.className,
    itemClassName = _ref.itemClassName,
    itemStyle = _ref.itemStyle,
    _ref$maxWidth = _ref.maxWidth,
    maxWidth = _ref$maxWidth === void 0 ? 960 : _ref$maxWidth,
    style = _ref.style,
    rest = _objectWithoutProperties(_ref, _excluded);
  if (!(items !== null && items !== void 0 && items.length)) return;
  return /*#__PURE__*/_jsx(SpotlightCard, _objectSpread({
    className: className,
    items: items,
    renderItem: function renderItem(item) {
      return /*#__PURE__*/_jsx(Item, _objectSpread({
        className: itemClassName,
        style: itemStyle
      }, item), item.title);
    },
    style: _objectSpread({
      maxWidth: maxWidth
    }, style)
  }, rest));
});
export default Features;