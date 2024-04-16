'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["flip", "reverse", "showBackground", "backgroundColor", "random", "animationDuration", "className", "colorFront", "colorBack", "strokeWidth", "style", "animation"];
import { useSize } from 'ahooks';
import { shuffle } from 'lodash-es';
import { memo, useCallback, useMemo, useRef } from 'react';
import Grid from "./Grid";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var GridBackground = /*#__PURE__*/memo(function (_ref) {
  var flip = _ref.flip,
    reverse = _ref.reverse,
    showBackground = _ref.showBackground,
    backgroundColor = _ref.backgroundColor,
    random = _ref.random,
    _ref$animationDuratio = _ref.animationDuration,
    animationDuration = _ref$animationDuratio === void 0 ? 8 : _ref$animationDuratio,
    className = _ref.className,
    colorFront = _ref.colorFront,
    colorBack = _ref.colorBack,
    strokeWidth = _ref.strokeWidth,
    style = _ref.style,
    animation = _ref.animation,
    rest = _objectWithoutProperties(_ref, _excluded);
  var ref = useRef(null);
  var size = useSize(ref);
  var _useStyles = useStyles({
      backgroundColor: backgroundColor,
      reverse: reverse
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx,
    theme = _useStyles.theme;
  var gridProps = useMemo(function () {
    return {
      className: styles.highlight,
      color: colorFront || theme.colorText,
      strokeWidth: strokeWidth
    };
  }, [reverse, colorFront, strokeWidth]);
  var HighlightGrid = useCallback(function () {
    if (!random) return /*#__PURE__*/_jsx(Grid, _objectSpread({
      style: {
        '--duration': "".concat(animationDuration, "s")
      }
    }, gridProps));
    var group = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    return /*#__PURE__*/_jsx(_Fragment, {
      children: shuffle(group).map(function (item, index) {
        return /*#__PURE__*/_jsx(Grid, _objectSpread({
          linePick: item,
          style: {
            '--delay': "".concat(index + Math.random(), "s"),
            '--duration': "".concat(animationDuration, "s")
          }
        }, gridProps), item);
      })
    });
  }, [random, animationDuration, gridProps]);
  return /*#__PURE__*/_jsxs("div", _objectSpread(_objectSpread({
    className: cx(styles.container, className),
    ref: ref,
    style: flip ? _objectSpread({
      transform: 'scaleY(-1)'
    }, style) : style
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(Grid, {
      color: colorBack || theme.colorBorder,
      strokeWidth: strokeWidth,
      style: {
        zIndex: 2
      }
    }), animation && /*#__PURE__*/_jsx(HighlightGrid, {}), showBackground && /*#__PURE__*/_jsx("div", {
      className: styles.backgroundContainer,
      style: size ? {
        fontSize: size.width / 80
      } : {},
      children: /*#__PURE__*/_jsx("div", {
        className: styles.background
      })
    })]
  }));
});
export default GridBackground;