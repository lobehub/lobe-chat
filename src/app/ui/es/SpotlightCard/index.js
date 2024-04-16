'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _createForOfIteratorHelper from "@babel/runtime/helpers/esm/createForOfIteratorHelper";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["items", "renderItem", "maxItemWidth", "className", "columns", "gap", "style", "size", "borderRadius", "spotlight"];
import { memo, useEffect, useRef } from 'react';
import Grid from "../Grid";
import SpotlightCardItem from "./SpotlightCardItem";
import { CHILDREN_CLASSNAME, useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var SpotlightCard = /*#__PURE__*/memo(function (_ref) {
  var items = _ref.items,
    Content = _ref.renderItem,
    maxItemWidth = _ref.maxItemWidth,
    className = _ref.className,
    _ref$columns = _ref.columns,
    columns = _ref$columns === void 0 ? 3 : _ref$columns,
    _ref$gap = _ref.gap,
    gap = _ref$gap === void 0 ? '1em' : _ref$gap,
    style = _ref.style,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 800 : _ref$size,
    _ref$borderRadius = _ref.borderRadius,
    borderRadius = _ref$borderRadius === void 0 ? 12 : _ref$borderRadius,
    _ref$spotlight = _ref.spotlight,
    spotlight = _ref$spotlight === void 0 ? true : _ref$spotlight,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      borderRadius: borderRadius,
      size: size
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var ref = useRef(null);
  useEffect(function () {
    if (!ref.current) return;
    if (!spotlight) return;
    var fn = function fn(e) {
      var _iterator = _createForOfIteratorHelper(document.querySelectorAll(".".concat(CHILDREN_CLASSNAME))),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var card = _step.value;
          var rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', "".concat(x, "px"));
          card.style.setProperty('--mouse-y', "".concat(y, "px"));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };
    ref.current.addEventListener('mousemove', fn);
    return function () {
      var _ref$current;
      (_ref$current = ref.current) === null || _ref$current === void 0 || _ref$current.removeEventListener('mousemove', fn);
    };
  }, []);
  return /*#__PURE__*/_jsx(Grid, _objectSpread(_objectSpread({
    className: cx(styles.container, styles.grid, className),
    gap: gap,
    maxItemWidth: maxItemWidth,
    ref: ref,
    rows: columns,
    style: style
  }, rest), {}, {
    children: items.map(function (item, index) {
      return /*#__PURE__*/_jsx(SpotlightCardItem, {
        borderRadius: borderRadius,
        className: CHILDREN_CLASSNAME,
        size: size,
        children: /*#__PURE__*/_jsx(Content, _objectSpread({}, item))
      }, index);
    })
  }));
});
export default SpotlightCard;