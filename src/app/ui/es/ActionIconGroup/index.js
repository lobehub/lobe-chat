'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["type", "items", "placement", "spotlight", "direction", "dropdownMenu", "onActionClick"];
import { Dropdown } from 'antd';
import { MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import Icon from "../Icon";
import Spotlight from "../Spotlight";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ActionIconGroup = /*#__PURE__*/memo(function (_ref) {
  var _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'block' : _ref$type,
    _ref$items = _ref.items,
    items = _ref$items === void 0 ? [] : _ref$items,
    placement = _ref.placement,
    _ref$spotlight = _ref.spotlight,
    spotlight = _ref$spotlight === void 0 ? true : _ref$spotlight,
    _ref$direction = _ref.direction,
    direction = _ref$direction === void 0 ? 'row' : _ref$direction,
    _ref$dropdownMenu = _ref.dropdownMenu,
    dropdownMenu = _ref$dropdownMenu === void 0 ? [] : _ref$dropdownMenu,
    onActionClick = _ref.onActionClick,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      type: type
    }),
    styles = _useStyles.styles;
  var tooltipsPlacement = placement || (direction === 'column' ? 'right' : 'top');
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    className: styles.container,
    horizontal: direction === 'row'
  }, rest), {}, {
    children: [spotlight && /*#__PURE__*/_jsx(Spotlight, {}), (items === null || items === void 0 ? void 0 : items.length) > 0 && items.map(function (item) {
      return /*#__PURE__*/_jsx(ActionIcon, {
        icon: item.icon,
        onClick: onActionClick ? function () {
          return onActionClick === null || onActionClick === void 0 ? void 0 : onActionClick({
            item: item,
            key: item.key,
            keyPath: [item.key]
          });
        } : undefined,
        placement: tooltipsPlacement,
        size: "small",
        title: item.label
      }, item.key);
    }), (dropdownMenu === null || dropdownMenu === void 0 ? void 0 : dropdownMenu.length) > 0 && /*#__PURE__*/_jsx(Dropdown, {
      menu: {
        items: dropdownMenu.map(function (item) {
          if (item.type) return item;
          return _objectSpread(_objectSpread({}, item), {}, {
            icon: /*#__PURE__*/_jsx(Icon, {
              icon: item.icon,
              size: "small"
            }),
            onClick: onActionClick ? function (info) {
              return onActionClick({
                item: item,
                key: info.key,
                keyPath: info.keyPath
              });
            } : undefined
          });
        })
      },
      trigger: ['click'],
      children: /*#__PURE__*/_jsx(ActionIcon, {
        icon: MoreHorizontal,
        placement: tooltipsPlacement,
        size: "small"
      }, "more")
    })]
  }));
});
export default ActionIconGroup;