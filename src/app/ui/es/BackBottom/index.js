'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useScroll } from 'ahooks';
import { Button } from 'antd';
import { ListEnd } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import Icon from "../Icon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var BackBottom = /*#__PURE__*/memo(function (_ref) {
  var _ref$visibilityHeight = _ref.visibilityHeight,
    visibilityHeight = _ref$visibilityHeight === void 0 ? 240 : _ref$visibilityHeight,
    target = _ref.target,
    onClick = _ref.onClick,
    style = _ref.style,
    className = _ref.className,
    text = _ref.text;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    visible = _useState2[0],
    setVisible = _useState2[1];
  var _useStyles = useStyles(visible),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var ref = useRef(null);
  var current = target === null || target === void 0 ? void 0 : target.current;
  var scrollHeight = (current === null || current === void 0 ? void 0 : current.scrollHeight) || 0;
  var clientHeight = (current === null || current === void 0 ? void 0 : current.clientHeight) || 0;
  var scroll = useScroll(target);
  useEffect(function () {
    if (scroll !== null && scroll !== void 0 && scroll.top) {
      setVisible((scroll === null || scroll === void 0 ? void 0 : scroll.top) + clientHeight + visibilityHeight < scrollHeight);
    }
  }, [scrollHeight, scroll, visibilityHeight]);
  var scrollToBottom = function scrollToBottom(e) {
    var _current;
    target === null || target === void 0 || (_current = target.current) === null || _current === void 0 || _current.scrollTo({
      behavior: 'smooth',
      left: 0,
      top: scrollHeight
    });
    onClick === null || onClick === void 0 || onClick(e);
  };
  return /*#__PURE__*/_jsx(Button, {
    className: cx(styles, className),
    icon: /*#__PURE__*/_jsx(Icon, {
      icon: ListEnd
    }),
    onClick: scrollToBottom,
    ref: ref,
    size: 'small',
    style: style,
    children: text || 'Back to bottom'
  });
});
export default BackBottom;