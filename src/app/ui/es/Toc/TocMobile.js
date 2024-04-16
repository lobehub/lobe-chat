import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { Anchor, Collapse, ConfigProvider } from 'antd';
import { PanelTopClose, PanelTopOpen } from 'lucide-react';
import { memo } from 'react';
import useControlledState from 'use-merge-value';
import ActionIcon from "../ActionIcon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
export var mapItems = function mapItems(items) {
  return items.map(function (item) {
    var _item$children;
    return {
      children: (_item$children = item.children) === null || _item$children === void 0 ? void 0 : _item$children.map(function (child) {
        return {
          href: "#".concat(child.id),
          key: child.id,
          title: child === null || child === void 0 ? void 0 : child.title
        };
      }),
      href: "#".concat(item.id),
      key: item.id,
      title: item.title
    };
  });
};
var TocMobile = /*#__PURE__*/memo(function (_ref) {
  var items = _ref.items,
    activeKey = _ref.activeKey,
    onChange = _ref.onChange,
    getContainer = _ref.getContainer,
    _ref$headerHeight = _ref.headerHeight,
    headerHeight = _ref$headerHeight === void 0 ? 64 : _ref$headerHeight,
    _ref$tocWidth = _ref.tocWidth,
    tocWidth = _ref$tocWidth === void 0 ? 176 : _ref$tocWidth;
  var _useControlledState = useControlledState('', {
      onChange: onChange,
      value: activeKey
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    activeLink = _useControlledState2[0],
    setActiveLink = _useControlledState2[1];
  var _useStyles = useStyles({
      headerHeight: headerHeight,
      tocWidth: tocWidth
    }),
    styles = _useStyles.styles;
  var activeAnchor = items.find(function (item) {
    return item.id === activeLink;
  });
  return /*#__PURE__*/_jsx(ConfigProvider, {
    theme: {
      token: {
        fontSize: 12,
        sizeStep: 3
      }
    },
    children: /*#__PURE__*/_jsx("section", {
      className: styles.mobileCtn,
      children: /*#__PURE__*/_jsx(Collapse, {
        bordered: false,
        className: styles.expand,
        expandIcon: function expandIcon(_ref2) {
          var isActive = _ref2.isActive;
          return isActive ? /*#__PURE__*/_jsx(ActionIcon, {
            icon: PanelTopClose,
            size: {
              blockSize: 24,
              borderRadius: 3,
              fontSize: 16,
              strokeWidth: 1
            }
          }) : /*#__PURE__*/_jsx(ActionIcon, {
            icon: PanelTopOpen,
            size: {
              blockSize: 24,
              borderRadius: 3,
              fontSize: 16,
              strokeWidth: 1
            }
          });
        },
        expandIconPosition: 'end',
        ghost: true,
        children: /*#__PURE__*/_jsx(Collapse.Panel, {
          forceRender: true,
          header: activeAnchor ? activeAnchor.title : 'TOC',
          children: /*#__PURE__*/_jsx(ConfigProvider, {
            theme: {
              token: {
                fontSize: 14,
                sizeStep: 4
              }
            },
            children: /*#__PURE__*/_jsx(Anchor, {
              getContainer: getContainer,
              items: mapItems(items),
              onChange: function onChange(currentLink) {
                setActiveLink(currentLink.replace('#', ''));
              },
              targetOffset: headerHeight + 48
            })
          })
        }, 'toc')
      })
    })
  });
});
export default TocMobile;