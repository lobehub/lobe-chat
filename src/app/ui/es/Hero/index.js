'use client';

import { Button, ConfigProvider } from 'antd';
import { useResponsive } from 'antd-style';
import * as LucideIcon from 'lucide-react';
import { memo, useCallback } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import GradientButton from "../GradientButton";
import GridBackground from "../GridBackground";
import Icon from "../Icon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Hero = /*#__PURE__*/memo(function (_ref) {
  var title = _ref.title,
    description = _ref.description,
    actions = _ref.actions;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var ButtonGroups = useCallback(function () {
    return Boolean(actions === null || actions === void 0 ? void 0 : actions.length) && /*#__PURE__*/_jsx(Flexbox, {
      className: styles.actions,
      gap: 24,
      horizontal: true,
      justify: 'center',
      children: actions.map(function (_ref2, index) {
        var text = _ref2.text,
          link = _ref2.link,
          openExternal = _ref2.openExternal,
          icon = _ref2.icon,
          type = _ref2.type;
        // @ts-ignore
        var ButtonIcon = icon && LucideIcon[icon];
        return /*#__PURE__*/_jsx("a", {
          href: link,
          rel: "noreferrer",
          target: openExternal ? '_blank' : undefined,
          children: type === 'primary' ? /*#__PURE__*/_jsx(GradientButton, {
            block: mobile,
            icon: ButtonIcon && /*#__PURE__*/_jsx(Icon, {
              icon: ButtonIcon
            }),
            size: "large",
            children: text
          }, index) : /*#__PURE__*/_jsx(Button, {
            block: mobile,
            icon: ButtonIcon && /*#__PURE__*/_jsx(Icon, {
              icon: ButtonIcon
            }),
            size: "large",
            type: "primary",
            children: text
          }, index)
        }, text);
      })
    });
  }, [actions]);
  return /*#__PURE__*/_jsx(ConfigProvider, {
    theme: {
      token: {
        fontSize: 16
      }
    },
    children: /*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      children: [/*#__PURE__*/_jsxs(Flexbox, {
        className: styles.container,
        distribution: 'center',
        horizontal: true,
        children: [/*#__PURE__*/_jsx("div", {
          className: styles.canvas
        }), /*#__PURE__*/_jsxs(Center, {
          children: [title && /*#__PURE__*/_jsx("h1", {
            className: styles.title,
            dangerouslySetInnerHTML: {
              __html: title
            }
          }), description && /*#__PURE__*/_jsx("p", {
            className: styles.desc,
            dangerouslySetInnerHTML: {
              __html: description
            }
          }), /*#__PURE__*/_jsx(ButtonGroups, {})]
        })]
      }), /*#__PURE__*/_jsx(GridBackground, {
        animation: true,
        random: true,
        strokeWidth: 4,
        style: {
          maxWidth: 960,
          width: '120%'
        }
      })]
    })
  });
});
export default Hero;