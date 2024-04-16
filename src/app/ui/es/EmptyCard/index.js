'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["cover", "visible", "defaultVisible", "onVisibleChange", "alt", "title", "desc", "width", "height", "imageProps"];
import { X } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useMergeState from 'use-merge-value';
import ActionIcon from "../ActionIcon";
import Img from "../Img";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var EmptyCard = /*#__PURE__*/memo(function (_ref) {
  var cover = _ref.cover,
    visible = _ref.visible,
    defaultVisible = _ref.defaultVisible,
    onVisibleChange = _ref.onVisibleChange,
    alt = _ref.alt,
    title = _ref.title,
    desc = _ref.desc,
    width = _ref.width,
    height = _ref.height,
    imageProps = _ref.imageProps,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useMergeState = useMergeState(true, {
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
      value: visible
    }),
    _useMergeState2 = _slicedToArray(_useMergeState, 2),
    value = _useMergeState2[0],
    setValue = _useMergeState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  if (!value) return null;
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    className: styles.container
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(ActionIcon, {
      className: styles.close,
      icon: X,
      onClick: function onClick() {
        return setValue(false);
      },
      size: {
        blockSize: 24,
        fontSize: 16
      }
    }), cover && /*#__PURE__*/_jsx(Img, _objectSpread({
      alt: alt,
      className: styles.image,
      height: height,
      src: cover,
      width: width
    }, imageProps)), /*#__PURE__*/_jsxs("div", {
      className: styles.content,
      children: [title && /*#__PURE__*/_jsx("h3", {
        children: title
      }), desc && /*#__PURE__*/_jsx("p", {
        className: styles.desc,
        children: desc
      })]
    })]
  }));
});
export default EmptyCard;