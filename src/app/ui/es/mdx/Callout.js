'use client';

import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
import { AlertOctagon, AlertTriangle, Info, Lightbulb, MessageSquareWarning } from 'lucide-react';
import { rgba } from 'polished';
import { Flexbox } from 'react-layout-kit';
import Icon from "../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      --lobe-markdown-margin-multiple: 1;\n\n      overflow: hidden;\n      gap: 0.75em;\n\n      margin-block: calc(var(--lobe-markdown-margin-multiple) * 1em);\n      padding-block: calc(var(--lobe-markdown-margin-multiple) * 1em);\n      padding-inline: 1em;\n\n      border: 1px solid transparent;\n      border-radius: calc(var(--lobe-markdown-border-radius) * 1px);\n    "]))),
    content: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      margin-block: calc(var(--lobe-markdown-margin-multiple) * -1em);\n\n      > div {\n        margin-block: calc(var(--lobe-markdown-margin-multiple) * 1em);\n      }\n\n      p {\n        color: inherit !important;\n      }\n    "]))),
    underlineAnchor: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      a {\n        text-decoration: underline;\n      }\n    "])))
  };
});
var Callout = function Callout(_ref2) {
  var children = _ref2.children,
    _ref2$type = _ref2.type,
    type = _ref2$type === void 0 ? 'info' : _ref2$type;
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles,
    theme = _useStyles.theme;
  var typeConfig = {
    error: {
      color: theme.colorError,
      icon: AlertOctagon
    },
    important: {
      color: theme.purple,
      icon: MessageSquareWarning
    },
    info: {
      color: theme.colorInfo,
      icon: Info
    },
    tip: {
      color: theme.colorSuccess,
      icon: Lightbulb
    },
    warning: {
      color: theme.colorWarning,
      icon: AlertTriangle
    }
  };
  var selectedType = (typeConfig === null || typeConfig === void 0 ? void 0 : typeConfig[type]) || typeConfig.info;
  var icon = selectedType.icon,
    color = selectedType.color;
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'flex-start',
    className: styles.container,
    horizontal: true,
    style: {
      background: rgba(color, 0.1),
      borderColor: rgba(color, 0.5),
      color: color
    },
    children: [/*#__PURE__*/_jsx(Icon, {
      icon: icon,
      size: {
        fontSize: '1.2em'
      },
      style: {
        marginBlock: '0.25em'
      }
    }), /*#__PURE__*/_jsx("div", {
      className: cx(styles.content, type === 'info' && styles.underlineAnchor),
      children: /*#__PURE__*/_jsx("div", {
        children: children
      })
    })]
  });
};
export default Callout;