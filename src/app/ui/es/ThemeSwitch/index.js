'use client';

import { Dropdown, Select } from 'antd';
import { Monitor, Moon, Sun } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import Icon from "../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var icons = {
  auto: Monitor,
  dark: Moon,
  light: Sun
};
var ThemeSwitch = /*#__PURE__*/memo(function (_ref) {
  var _ref$size = _ref.size,
    size = _ref$size === void 0 ? 'site' : _ref$size,
    themeMode = _ref.themeMode,
    onThemeSwitch = _ref.onThemeSwitch,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'icon' : _ref$type,
    _ref$labels = _ref.labels,
    labels = _ref$labels === void 0 ? {
      auto: 'System',
      dark: 'Dark',
      light: 'Light'
    } : _ref$labels,
    className = _ref.className,
    style = _ref.style;
  var items = useMemo(function () {
    return [{
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: icons.auto,
        size: "small"
      }),
      key: 'auto',
      label: labels.auto
    }, {
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: icons.light,
        size: "small"
      }),
      key: 'light',
      label: labels.light
    }, {
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: icons.dark,
        size: "small"
      }),
      key: 'dark',
      label: labels.dark
    }];
  }, [labels]);
  if (type === 'select') {
    return /*#__PURE__*/_jsx(Select, {
      className: className,
      defaultValue: themeMode,
      onChange: onThemeSwitch,
      options: items.map(function (item) {
        return {
          label: /*#__PURE__*/_jsxs(Flexbox, {
            direction: 'horizontal',
            gap: 8,
            children: [item.icon, item.label]
          }),
          value: item.key
        };
      }),
      style: style
    });
  } else {
    var menuProps = {
      items: items,
      onClick: function onClick(e) {
        return onThemeSwitch(e.key);
      }
    };
    return /*#__PURE__*/_jsx(Dropdown, {
      menu: menuProps,
      trigger: ['click'],
      children: /*#__PURE__*/_jsx(ActionIcon, {
        className: className,
        icon: icons[themeMode],
        size: size,
        style: style
      })
    });
  }
});
export default ThemeSwitch;