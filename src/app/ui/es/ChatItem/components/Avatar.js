import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import A from "../../Avatar";
import { useStyles } from "../style";
import Loading from "./Loading";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Avatar = /*#__PURE__*/memo(function (_ref) {
  var loading = _ref.loading,
    avatar = _ref.avatar,
    placement = _ref.placement,
    unoptimized = _ref.unoptimized,
    addon = _ref.addon,
    onClick = _ref.onClick,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 40 : _ref$size;
  var _useStyles = useStyles({
      avatarSize: size
    }),
    styles = _useStyles.styles;
  var avatarContent = /*#__PURE__*/_jsxs("div", {
    className: styles.avatarContainer,
    children: [/*#__PURE__*/_jsx(A, {
      animation: loading,
      avatar: avatar.avatar,
      background: avatar.backgroundColor,
      onClick: onClick,
      size: size,
      title: avatar.title,
      unoptimized: unoptimized
    }), /*#__PURE__*/_jsx(Loading, {
      loading: loading,
      placement: placement
    })]
  });
  if (!addon) return avatarContent;
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    className: styles.avatarGroupContainer,
    gap: 8,
    children: [avatarContent, addon]
  });
});
export default Avatar;