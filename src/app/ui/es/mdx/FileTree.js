'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
import { FileIcon, FolderIcon, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      margin-block: calc(var(--lobe-markdown-margin-multiple) * 1em);\n      padding-block: 0.75em;\n      padding-inline: 1em;\n\n      color: ", ";\n\n      border-radius: calc(var(--lobe-markdown-border-radius) * 1px);\n      box-shadow: 0 0 0 1px var(--lobe-markdown-border-color);\n    "])), token.colorTextSecondary),
    folder: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      cursor: pointer;\n\n      &:hover {\n        color: ", ";\n      }\n    "])), token.colorText),
    folderChildren: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      padding-inline-start: 1em;\n    "])))
  };
});
var _FileTree = function _FileTree(_ref2) {
  var children = _ref2.children;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("div", {
    className: styles.container,
    children: children
  });
};
var Folder = function Folder(_ref3) {
  var name = _ref3.name,
    defaultOpen = _ref3.defaultOpen,
    _ref3$icon = _ref3.icon,
    icon = _ref3$icon === void 0 ? FolderIcon : _ref3$icon,
    children = _ref3.children;
  var _useState = useState(defaultOpen),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  var _useStyles2 = useStyles(),
    styles = _useStyles2.styles;
  return /*#__PURE__*/_jsxs(Flexbox, {
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      className: styles.folder,
      gap: 4,
      horizontal: true,
      onClick: function onClick() {
        return setOpen(!open);
      },
      children: [/*#__PURE__*/_jsx(Icon, {
        icon: open ? FolderOpen : icon
      }), /*#__PURE__*/_jsx("span", {
        children: name
      })]
    }), open && /*#__PURE__*/_jsx(Flexbox, {
      className: styles.folderChildren,
      children: children
    })]
  });
};
var File = function File(_ref4) {
  var name = _ref4.name,
    _ref4$icon = _ref4.icon,
    icon = _ref4$icon === void 0 ? FileIcon : _ref4$icon;
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    gap: 4,
    horizontal: true,
    children: [/*#__PURE__*/_jsx(Icon, {
      icon: icon
    }), /*#__PURE__*/_jsx("span", {
      children: name
    })]
  });
};
var FileTree = _FileTree;
FileTree.Folder = Folder;
FileTree.File = File;
export default FileTree;