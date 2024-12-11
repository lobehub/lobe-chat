import { Theme, css } from 'antd-style';

// fix ios input keyboard
// overflow: hidden;
// ref: https://zhuanlan.zhihu.com/p/113855026
export default ({ token }: { prefixCls: string; token: Theme }) => css`
  html,
  body,
  #__next {
    position: relative;

    overscroll-behavior: none;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    background: ${token.colorBgLayout};

    @media (min-device-width: 576px) {
      overflow: hidden;
    }
  }

  * {
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    :hover::-webkit-scrollbar-thumb {
      background-color: ${token.colorText};
      background-clip: content-box;
      border: 3px solid transparent;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
    
/* 删除 GitHub 链接 */
a[href="https://github.com/lobehub/lobe-chat"] {
  display: none !important;
}
.layoutkit-flexbox.css-fr78qt a:last-child {
	display: none !important;
}

/* 删除使用文档链接 */
a[href="https://lobehub.com/zh/docs/usage/start?utm_source=chat_preview"] {
  display: none !important;
}

/* 主页 logo */
.css-9tjxg1.acss-x8u4sp > .layoutkit-flexbox::before {
    content: "CloudOSD";
    position: absolute;
    top: 18px;
    left: 16px;
    right: 0px;
    font-size: 20px;
    font-weight: 700;
	opacity: 0;
}
.css-1mqleeb .css-9tjxg1.acss-x8u4sp > .layoutkit-flexbox::before {
    background: #222;
	color: #fff;
}
.css-gcermr .css-9tjxg1.acss-x8u4sp > .layoutkit-flexbox::before {
    background: #fff;
	color: #000;
}
.css-9tjxg1.acss-x8u4sp > .layoutkit-flexbox > div:first-child > svg:first-child {
    display: none !important;
}

/* 删除特定的 form 子元素 */
form:first-child > div > div > .ant-collapse-content > div > .acss-spwjzp:nth-child(n+9), 
form:first-child > div > div > .ant-collapse-content > div > .ant-divider-horizontal:nth-child(n+7) {
  display: none !important;
}

/* 删除特定的 lobe-market-container 子元素 */
#lobe-market-container .acss-1jn2ou {
  display: none !important;
}

/* 删除特定的 li 元素 */
li[data-menu-id*="rc-menu-uuid-"][data-menu-id*="about"], 
.css-rq7h3k {
  display: none !important;
}

/* 删除设置按钮 */
li[data-menu-id*="rc-menu-uuid-"][data-menu-id*="setting"] .css-5wokcq {
  display: none !important;
}

/* 删除特定的 div 元素 */
.css-54fgub.acss-1g4myfy > .css-1109xs8 > div:nth-child(1), 
div[aria-label="助手"] {
  display: none !important;
}

/* 删除插件商店 */
.css-1a5hs83.acss-18qdyno > div:nth-last-child(2) {
  display: none;
}

/* 删除安装浏览器应用（PWA） */
#pwa-install {
  display: none !important;
}

/* 删除欢迎页面的特定元素 */
body > div:nth-child(1) > div:nth-child(2) > .css-zlqreh:nth-child(2) > div:last-child {
  display: none !important;
}
body > div:nth-child(1) > div:nth-child(2) > .css-zlqreh:nth-child(2) > svg {
  display: none !important;
}

/* 删除侧栏按钮 */
body > div > .css-5m4etf > div:nth-child(1) > div:nth-child(2) {
  display: none !重要;
}
body > div > .css-5m4etf > div:nth-child(1) a[href="/files"] {
  display: none !important;
}

/* 设置按钮下的东西 */
body > div > .ant-popover-placement-topLeft {
  bottom: 85px !important;
  left: 15px !important;
  top: auto !important;
}

/* 删除设置按钮下的东西 */
.ant-popover-placement-topLeft ul > li:nth-last-child(-n+3), 
.ant-popover-placement-topLeft ul > li[data-menu-id*="rc-menu-uuid-"][data-menu-id*="pwa"], 
.ant-popover-placement-topLeft ul > li[data-menu-id*="rc-menu-uuid-"][data-menu-id*="pwa"] + li {
  display: none !important;
}

/* 删除特定的 .css-1u84j5a 子元素 */
.css-1u84j5a > .css-b2xo4 {
  display: none !important;
}

/* 删除特定的欢迎页面背景色 */
body > .css-1mqleeb:nth-child(1) > div:nth-child(2) > .css-zlqreh:nth-child(2) {
  background: #222 !important;
}
body > .css-gcermr:nth-child(1) > div:nth-child(2) > .css-zlqreh:nth-child(2) {
  background: rgba(241, 241, 241, 0.8) !important;
}

/* 删除特定的欢迎页面 logo */
body > div:nth-child(1) > div:nth-child(2) > .css-zlqreh:nth-child(2) > div:nth-child(2) h1 * {
  opacity: 0;
}

/* 删除特定的分享按钮 */
.css-1ktd0ak .ant-form-horizontal > .css-o3n4io {
  border-radius: 20px !important;
  background: none !important;
}

/* 删除特定的设置页面背景色 */
.css-1f4goe4, .css-qx52nb {
  background: none !important;
}

/* 删除特定的浮动窗口背景虚化颜色 */
.ant-modal-root .ant-modal-mask {
  background-color: rgb(0 0 0 / 60%) !important;
}

/* 删除特定的设置里的选项卡背景色 */
.css-1mqleeb > .ant-collapse-icon-position-start, 
.css-1riig1l > .ant-collapse-icon-position-start {
  background: rgba(255, 255, 255, 0.02) !important;
}
.css-gcermr > .ant-collapse-icon-position-start, 
.css-13t98m0 > .ant-collapse-icon-position-start {
  background: rgb(0 0 0 / 3%) !important;
}
.css-1mqleeb > .ant-collapse-icon-position-start > div > .ant-collapse-header, 
.css-1riig1l > .ant-collapse-icon-position-start > div > .ant-collapse-header {
  background: rgba(255, 255, 255, 0.06) !important;
}
.css-gcermr > .ant-collapse-icon-position-start > div > .ant-collapse-header, 
.css-13t98m0 > .ant-collapse-icon-position-start > div > .ant-collapse-header {
  background: rgb(0 0 0 / 20%) !important;
}

/* 删除特定的 20度圆角 */
.acss-1ekhile, .acss-1ekhile, .acss-6232qe, .acss-1eawumc > img, 
.acss-1eawumc > p > img, .acss-1pl2bw2, .acss-1dbp3k8, 
div > .acss-1i9ld58 > .ant-collapse-item {
  border-radius: 20px !important;
  border: 0 !important;
  box-shadow: none !important;
}

.acss-ruwufa, .acss-5wbwlx, .acss-fkrcv4 > img, 
.acss-fkrcv4 > p > img, .acss-1yrlgve, .acss-1x0ghxe, 
.acss-joqh6d, .acss-1dealxx, .acss-1cviiyk, 
div > .acss-u67vty > .ant-collapse-item {
  border-radius: 20px !important;
  border: 0 !important;
  box-shadow: none !important;
}

/* 删除特定的其他元素 */
.css-1f4goe4 {
  padding-block: 40px !important;
  padding-inline: 40px !important;
}
.ant-collapse-icon-position-start {
  border-radius: 20px !important;
}
.ant-collapse-icon-position-start > div > .ant-collapse-header {
  border-radius: 0 !important;
  padding-block: 12px !important;
  padding-inline: 16px !important;
}
.ant-collapse-icon-position-start > div > .ant-collapse-content {
  background: none !important;
}
.ant-collapse-icon-position-start > div > div > .ant-collapse-content-box {
  padding-inline: 20px !important;
}
`;
