import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style", "className", "row", "column", "description", "image", "title", "link", "icon", "imageStyle", "openExternal"];
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import A from "../A";
import Icon from "../Icon";
import Img from "../Img";
import { useStyles } from "./style";

// @ts-ignore
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Image = /*#__PURE__*/memo(function (_ref) {
  var image = _ref.image,
    className = _ref.className,
    title = _ref.title,
    style = _ref.style;
  return image.startsWith('http') ? /*#__PURE__*/_jsx(Img, {
    alt: title,
    className: className,
    src: image,
    style: style
  }) : /*#__PURE__*/_jsx(Center, {
    className: className,
    style: style,
    children: image
  });
});
var Item = /*#__PURE__*/memo(function (_ref2) {
  var style = _ref2.style,
    className = _ref2.className,
    row = _ref2.row,
    column = _ref2.column,
    description = _ref2.description,
    image = _ref2.image,
    title = _ref2.title,
    link = _ref2.link,
    icon = _ref2.icon,
    imageStyle = _ref2.imageStyle,
    openExternal = _ref2.openExternal,
    rest = _objectWithoutProperties(_ref2, _excluded);
  var rowNumber = row || 7;
  var _useStyles = useStyles({
      hasLink: Boolean(link),
      rowNum: rowNumber
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx("div", _objectSpread(_objectSpread({
    className: cx(styles.container, className),
    style: _objectSpread({
      gridColumn: "span ".concat(column || 1),
      gridRow: "span ".concat(rowNumber)
    }, style)
  }, rest), {}, {
    children: /*#__PURE__*/_jsxs("div", {
      className: styles.cell,
      children: [image || icon && /*#__PURE__*/_jsxs(Center, {
        className: styles.imgContainer,
        style: imageStyle,
        children: [icon && /*#__PURE__*/_jsx(Icon, {
          className: styles.img,
          icon: icon
        }), image && /*#__PURE__*/_jsx(Image, {
          className: styles.img,
          image: image,
          title: title
        })]
      }), title && /*#__PURE__*/_jsx(Flexbox, {
        align: 'center',
        as: 'h3',
        className: styles.title,
        gap: 8,
        horizontal: true,
        children: title
      }), description && /*#__PURE__*/_jsx("p", {
        className: styles.desc,
        dangerouslySetInnerHTML: {
          __html: description
        }
      }), link && /*#__PURE__*/_jsx("div", {
        className: styles.link,
        children: /*#__PURE__*/_jsx(A, {
          href: link,
          rel: "noreferrer",
          target: openExternal ? '_blank' : undefined,
          children: "Read More"
        })
      })]
    })
  }));
});
export default Item;