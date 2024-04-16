'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';
import MobileSafeArea from "../MobileSafeArea";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var MobileTabBar = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    safeArea = _ref.safeArea,
    style = _ref.style,
    items = _ref.items,
    activeKey = _ref.activeKey,
    defaultActiveKey = _ref.defaultActiveKey,
    onChange = _ref.onChange;
  var _useControlledState = useControlledState(defaultActiveKey || items[0].key, {
      defaultValue: defaultActiveKey,
      onChange: onChange,
      value: activeKey
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    currentActive = _useControlledState2[0],
    setCurrentActive = _useControlledState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: cx(styles.container, className),
    style: style,
    children: [/*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.inner,
      horizontal: true,
      justify: 'space-around',
      children: items.map(function (item) {
        var active = item.key === currentActive;
        return /*#__PURE__*/_jsxs(Flexbox, {
          align: 'center',
          className: cx(styles.tab, active && styles.active),
          gap: 4,
          justify: 'center',
          onClick: function onClick() {
            var _item$onClick;
            setCurrentActive(item.key);
            item === null || item === void 0 || (_item$onClick = item.onClick) === null || _item$onClick === void 0 || _item$onClick.call(item);
          },
          children: [/*#__PURE__*/_jsx(Flexbox, {
            align: 'center',
            className: styles.icon,
            justify: 'center',
            children: typeof item.icon === 'function' ? item.icon(active) : item.icon
          }), /*#__PURE__*/_jsx("div", {
            className: styles.title,
            children: typeof item.title === 'function' ? item.title(active) : item.title
          })]
        }, item.key);
      })
    }), safeArea && /*#__PURE__*/_jsx(MobileSafeArea, {
      position: 'bottom'
    })]
  });
});
export default MobileTabBar;