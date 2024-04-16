import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["onVisibleChange", "styles", "minScale", "maxScale", "toolbarAddon"];
import { FlipHorizontal, FlipVertical, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import Icon from "../Icon";
import Preview from "./Preview";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var usePreview = function usePreview() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _onVisibleChange = _ref.onVisibleChange,
    _ref$styles = _ref.styles,
    previewStyle = _ref$styles === void 0 ? {} : _ref$styles,
    _ref$minScale = _ref.minScale,
    minScale = _ref$minScale === void 0 ? 0.32 : _ref$minScale,
    _ref$maxScale = _ref.maxScale,
    maxScale = _ref$maxScale === void 0 ? 32 : _ref$maxScale,
    toolbarAddon = _ref.toolbarAddon,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    visible = _useState2[0],
    setVisible = _useState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return _objectSpread({
    closeIcon: /*#__PURE__*/_jsx(Icon, {
      icon: X,
      size: {
        fontSize: 18,
        strokeWidth: 3
      }
    }),
    imageRender: function imageRender(node) {
      return /*#__PURE__*/_jsx(Preview, {
        visible: visible,
        children: node
      });
    },
    maxScale: maxScale,
    minScale: minScale,
    onVisibleChange: function onVisibleChange(visible, prevVisible, current) {
      setVisible(visible);
      _onVisibleChange === null || _onVisibleChange === void 0 || _onVisibleChange(visible, prevVisible, current);
    },
    styles: _objectSpread({
      mask: {
        backdropFilter: 'blur(2px)'
      }
    }, previewStyle),
    toolbarRender: function toolbarRender(_, _ref2) {
      var scale = _ref2.transform.scale,
        _ref2$actions = _ref2.actions,
        onFlipY = _ref2$actions.onFlipY,
        onFlipX = _ref2$actions.onFlipX,
        onRotateLeft = _ref2$actions.onRotateLeft,
        onRotateRight = _ref2$actions.onRotateRight,
        onZoomOut = _ref2$actions.onZoomOut,
        onZoomIn = _ref2$actions.onZoomIn;
      return /*#__PURE__*/_jsxs(Flexbox, {
        className: styles.toolbar,
        gap: 4,
        horizontal: true,
        children: [/*#__PURE__*/_jsx(ActionIcon, {
          color: '#fff',
          icon: FlipHorizontal,
          onClick: onFlipX
        }), /*#__PURE__*/_jsx(ActionIcon, {
          color: '#fff',
          icon: FlipVertical,
          onClick: onFlipY
        }), /*#__PURE__*/_jsx(ActionIcon, {
          color: '#fff',
          icon: RotateCcw,
          onClick: onRotateLeft
        }), /*#__PURE__*/_jsx(ActionIcon, {
          color: '#fff',
          icon: RotateCw,
          onClick: onRotateRight
        }), /*#__PURE__*/_jsx(ActionIcon, {
          color: '#fff',
          disable: scale === minScale,
          icon: ZoomOut,
          onClick: onZoomOut
        }), /*#__PURE__*/_jsx(ActionIcon, {
          color: '#fff',
          disable: scale === maxScale,
          icon: ZoomIn,
          onClick: onZoomIn
        }), toolbarAddon]
      });
    }
  }, rest);
};
export default usePreview;