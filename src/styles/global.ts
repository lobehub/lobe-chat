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




::selection {
    background: #99e640 !important;
    color: #000 !important;
}
::-webkit-scrollbar {
    width: 4px !important;
    height: 0 !important;
    background: rgb(255 0 0 / 0%) !important;
}
::-webkit-scrollbar-thumb {
    background: rgb(0 0 0 / 20%) !important;
}
::-webkit-scrollbar-thumb:hover {
    background: #673AB7 !important;
}
/* body {
    background: url(https://dl.cmdpe.com/HelloGPT/img0.jpg) center center / cover no-repeat fixed !important;
} */
.acss-1fiv48o {
    background: #232323 !important;
    justify-content: center;
}
.acss-1jlj8ui {
    background: #fff !important;
    justify-content: center;
	padding-bottom: 5px;
}
.css-5m4etf {
    width: 80% !important;
    height: 86% !important;
    position: relative !important;
    z-index: 9 !important;
	justify-content: center;
}
.css-5m4etf::after {
    content: "";
    position: absolute;
    top: -9px;
    bottom: -9px;
    left: 9px;
    right: 9px;
    z-index: -1;
}
.acss-1jlj8ui .css-5m4etf,.acss-1jlj8ui .css-5m4etf::after {
    background: #222;
}
.acss-1fiv48o .css-5m4etf,.acss-1fiv48o .css-5m4etf::after {
    background: #fff;
}
.acss-1jlj8ui .css-5m4etf>aside:nth-child(2),.acss-1jlj8ui .css-5m4etf>div:nth-child(3)>div:nth-child(1),.acss-1jlj8ui .css-5m4etf>div:nth-child(3)>div:nth-child(2)>aside:nth-child(2),.acss-1jlj8ui .acss-1s2s9nk,.acss-1jlj8ui .acss-yo1cec,.acss-1jlj8ui .css-5m4etf>div:nth-child(2)>div:nth-child(1) {
	background: #222 !important;
}
.acss-1fiv48o .css-5m4etf>aside:nth-child(2),.acss-1fiv48o .css-5m4etf>div:nth-child(3)>div:nth-child(1),.acss-1fiv48o .css-5m4etf>div:nth-child(3)>div:nth-child(2)>aside:nth-child(2),.acss-1fiv48o .acss-1s2s9nk,.acss-1fiv48o .acss-nyfi2l,.acss-1fiv48o .css-5m4etf>div:nth-child(2)>div:nth-child(1) {
	background: #fff !important;
}
.acss-rlur1a {
    box-shadow: none !important;
}
.acss-1jlj8ui a:hover,.acss-1jlj8ui button:hover {
    color: #fff !important;
}
/* 对话页与设置页切割造型 */
.css-5m4etf>aside::before,.css-5m4etf>aside::after,.css-5m4etf>div:nth-child(2)::before,.css-5m4etf>div:nth-child(2)::after {
    content: '';
    position: absolute;
    right: 0;
    width: 9px;
    height: 9px;
}
.css-5m4etf>aside::before,.css-5m4etf>div:nth-child(2)::before {
    top: -9px;
}
.css-5m4etf>aside::after,.css-5m4etf>div:nth-child(2)::after {
    bottom: -9px;
}
.acss-1jlj8ui .css-5m4etf>aside::before,.acss-1jlj8ui .css-5m4etf>aside::after,.acss-1jlj8ui .css-5m4etf>div:nth-child(2)::before,.acss-1jlj8ui .css-5m4etf>div:nth-child(2)::after {
    background: #fff !important;
}
.acss-1fiv48o .css-5m4etf>aside::before,.acss-1fiv48o .css-5m4etf>aside::after,.acss-1fiv48o .css-5m4etf>div:nth-child(2)::before,.acss-1fiv48o .css-5m4etf>div:nth-child(2)::after {
    background: #232323 !important;
}

/* 对话页对话选项卡 */
.LazyLoad.is-visible>a>div:first-child,a[href="/chat?session=inbox"]>div {
	margin: 20px 0;
    height: 70px;
    border-radius: 0;
	transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);
}
a[href="/chat?session=inbox"]>div {
	margin-top: 10px !important;
}
.LazyLoad.is-visible>a>div:first-child::before,a[href="/chat?session=inbox"]>div::before {
    content: "";
    position: absolute;
    top: -6px;
    bottom: -6px;
    left: 6px;
    right: 6px;
    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);
}
.acss-1jlj8ui .LazyLoad.is-visible>a>div:first-child,.acss-1jlj8ui .LazyLoad.is-visible>a>div:first-child::before,.acss-1jlj8ui a[href="/chat?session=inbox"]>div,.acss-1jlj8ui a[href="/chat?session=inbox"]>div::before {
    background: #161616;
}
.acss-1fiv48o .LazyLoad.is-visible>a>div:first-child,.acss-1fiv48o .LazyLoad.is-visible>a>div:first-child::before,.acss-1fiv48o a[href="/chat?session=inbox"]>div,.acss-1fiv48o a[href="/chat?session=inbox"]>div::before {
    background: #f1f1f1;
}
.acss-1jlj8ui .LazyLoad.is-visible>a>div:first-child:hover,.acss-1jlj8ui .LazyLoad.is-visible>a>div:first-child:hover::before,.acss-1jlj8ui .LazyLoad.is-visible>a>.acss-l0xyvp,.acss-1jlj8ui .LazyLoad.is-visible>a>.acss-l0xyvp::before {
    background: #673ab7 !important;
}
.acss-1fiv48o .LazyLoad.is-visible>a>div:first-child:hover,.acss-1fiv48o .LazyLoad.is-visible>a>div:first-child:hover::before,.acss-1fiv48o .LazyLoad.is-visible>a>.acss-1uqtsel,.acss-1fiv48o .LazyLoad.is-visible>a>.acss-1uqtsel::before {
    background: #99e640 !important;
}
.acss-1jlj8ui a[href="/chat?session=inbox"]>div:hover,.acss-1jlj8ui a[href="/chat?session=inbox"]>div:hover::before,.acss-1jlj8ui a[href="/chat?session=inbox"]>.acss-l0xyvp,.acss-1jlj8ui a[href="/chat?session=inbox"]>.acss-l0xyvp::before {
    background: #673ab7 !important;
}
.acss-1fiv48o a[href="/chat?session=inbox"]>div:hover,.acss-1fiv48o a[href="/chat?session=inbox"]>div:hover::before,.acss-1fiv48o a[href="/chat?session=inbox"]>.acss-1uqtsel,.acss-1fiv48o a[href="/chat?session=inbox"]>.acss-1uqtsel::before {
    background: #99e640 !important;
}
.LazyLoad.is-visible>a>div:first-child .acss-1hsh9br:hover {
    color: #fff !important;
    background: #333 !important;
}
.LazyLoad.is-visible>a>div:first-child .acss-1rzhzi1:hover {
    color: #000 !important;
    background: #eee !important;
}
.acss-1jlj8ui .LazyLoad.is-visible>a>div:first-child>div:last-child {
    z-index: 1 !important;
	color: #666 !important;
}
.acss-1fiv48o .LazyLoad.is-visible>a>div:first-child>div:last-child {
    z-index: 1 !important;
	color: #bbb !important;
}
.acss-1jlj8ui .LazyLoad.is-visible>a>div:first-child>div>div {
    color: #bbb !important;
}
.acss-1fiv48o .LazyLoad.is-visible>a>div:first-child>div>div {
    color: #999 !important;
}
.acss-1jlj8ui .ant-collapse-ghost.ant-collapse-small>div>.ant-collapse-header {
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.06) !important;
}
.acss-1fiv48o .ant-collapse-ghost.ant-collapse-small>div>.ant-collapse-header {
    border-radius: 10px !important;
    background: #f1f1f1 !important;
}
/* 跳转至当前按钮 */
.acss-1pj5wwz>div>button {
	border-radius: 10px !important;
}
.acss-1pj5wwz>div>button>span:first-child {
	margin: 0 !important;
}
.acss-1pj5wwz>div>button>span:last-child {
	display: none !important
}
.acss-1pj5wwz>div>button:hover {
    background: #FF5722 !important;
}
/* 侧边栏颜色 */
.acss-1jlj8ui .css-5m4etf>div:first-child {
    background: #111 !important;
}
.acss-1fiv48o .css-5m4etf>div:first-child {
    background: #fff !important;
}
/* 主页hellogpt logo */
.css-9tjxg1.acss-lo0bkt>.layoutkit-flexbox::before {
    content: "HelloGPT";
    position: absolute;
    top: 18px;
    left: 16px;
    right: 0px;
    font-size: 20px;
    font-weight: 700;
}
.acss-1jlj8ui .css-9tjxg1.acss-lo0bkt>.layoutkit-flexbox::before {
    background: #222;
	color: #fff;
}
.acss-1fiv48o .css-9tjxg1.acss-lo0bkt>.layoutkit-flexbox::before {
    background: #fff;
	color: #000;
}
/* 主页同步按钮 */
.css-1109xs8>div>.ant-tag {
    padding: 3px 10px;
    border-radius: 10px;
}
.acss-1jlj8ui .css-1109xs8>div>.ant-tag {
    background: #111;
}
.acss-1fiv48o .css-1109xs8>div>.ant-tag {
    background: #f1f1f1;
}
/* 新建助手按钮 */
.acss-1hsh9br:hover {
    color: #fff !important;
    background-color: rgb(103 58 183) !important;
	border-radius: 10px !important;
}
.acss-1rzhzi1:hover {
    color: #000 !important;
    background-color: #99e640 !important;
}
/* 左侧栏按钮激活颜色 */
.acss-wpp9jw {
    background: #99e640 !important;
	border-radius: 10px 10px 0 10px !important;
}
.acss-i3padr {
    background: #673AB7 !important;
}
/* 右侧栏按钮 */
aside .css-1u84j5a {
    margin: 5px 0 !important;
    border-radius: 10px !important;
    height: 40px !important;
}
.acss-1jlj8ui aside .css-1u84j5a:hover, .acss-3i04cy {
    background: #161616 !important;
}
.acss-1fiv48o aside .css-1u84j5a:hover,.acss-hyvqjb {
    background: rgba(0, 0, 0, 0.06) !important;
}
/* 对话框背景色 */
.acss-1jlj8ui .acss-1fr3od3>.css-o3n4io {
    background-color: #161616 !important;
}
.acss-1fiv48o .acss-1fr3od3>.css-o3n4io {
    background-color: #f1f1f1 !important;
}
/* 对话框背圆角 */
.acss-1fr3od3>.acss-12mj41h {
    border-radius: 10px 20px 20px !important;
}
.css-roa2v7>.acss-9nl0uq {
    border-radius: 10px 20px 20px !important;
}
.acss-1fr3od3>.acss-1xfxwg6 {
    border-radius: 20px 10px 20px 20px !important;
}
.css-4preuj>.acss-9nl0uq {
    border-radius: 20px 10px 20px 20px !important;
}
/* 对话框代码高亮 */
.acss-1jlj8ui div [data-code-type='highlighter'] {
    background: none !important;
	border-radius: 20px !important;
	box-shadow: 0 0 0 1px #333 !important;
}
.acss-1fiv48o div [data-code-type='highlighter'] {
    background: #fff !important;
	border-radius: 20px !important;
	box-shadow: 0 0 0 1px #00000000;
}
.acss-1jlj8ui div [data-code-type='highlighter']:hover {
    background: none !important;
}
.acss-1fiv48o div [data-code-type='highlighter']:hover {
    background: #fff !important;
}
.acss-1jlj8ui div [data-code-type='highlighter']>div:nth-child(1) {
	background: #222 !important;
}
.acss-1fiv48o div [data-code-type='highlighter']>div:nth-child(1) {
    background: #333 !important;
}
.acss-1jlj8ui div [data-code-type='highlighter']>div:nth-child(1):hover {
	background: #333 !important;
}
.acss-1fiv48o div [data-code-type='highlighter']>div:nth-child(1):hover {
    background: #673AB7 !important;
}
.acss-1jlj8ui div [data-code-type='highlighter']>div:nth-child(1)>div:nth-child(3):hover {
	background: #673ab7 !important;
}
.acss-1fiv48o div [data-code-type='highlighter']>div:nth-child(1)>div:nth-child(3):hover {
    background: #99e640 !important;
}
/* 对话框旁边小按钮 */
div[role='menubar']>div {
    border-radius: 10px !important;
}
/* 对话框pre */
/* .acss-1jlj8ui div [data-code-type='highlighter'] pre {
    background: #000 !important;
}
.acss-1fiv48o div [data-code-type='highlighter'] pre {
    background: #fff !important;
} */
/* 对话框警告 */
.ant-alert-warning {
    border-radius: 20px !important;
    border: 0 !important;
}
/* 对话框重新编辑对话 */
.acss-1jlj8ui .acss-v66yhe {
    border: 0 !important;
    border-radius: 20px !important;
    background: #333 !important;
    padding: 12px !important;
}
.acss-1fiv48o .acss-xfb8ma {
    border: 0 !important;
    border-radius: 20px !important;
    background: #f1f1f1 !important;
    padding: 12px !important;
}
/* 对话框插件 */
.acss-y5mm5q,.acss-45pdy5 {
	border-radius: 20px !important;
}
.acss-5eke9d,.acss-3zi5f8 {
	border-radius: 20px !important;
    background: #fff !important;
}
/* 提示输入key对话框 */
.acss-mar5is {
    padding: 10px;
	border-radius: 0 !important;
}
.acss-mar5is .ant-alert-warning+div {
    background: none !important;
    border-radius: 20px !important;
}
/* 输入框上方按钮圆角 */
.css-5wokcq {
    border-radius: 10px !important;
}
/* 输入框上方使用按钮 */
.acss-1jso55,.acss-v5ajt {
    padding-inline: 8px 10.6px !important;
    border-radius: 10px !important;
}
.acss-1jso55 {
    background: #161616 !important;
}
.acss-v5ajt {
    background: #eee !important;
}
/* 输入框上方插件按钮 */
ul.ant-dropdown-menu-item-group-list li span.ant-dropdown-menu-item-icon {
    margin-inline-end: 0 !important;
    margin-left: 10px !important;
}
/* 发送消息按钮 */
.acss-1jlj8ui button.ant-btn {
    background: #6639b5 !important;
    color: #fff !important;
    border: 0 !important;
	border-radius: 10px !important;
}
.acss-1fiv48o button.ant-btn {
    background: #99e640 !important;
    color: #000 !important;
    border: 0 !important;
	border-radius: 10px !important;
}
.ant-space-compact>button:nth-child(1) {
    border-radius: 10px 0 0 10px !important;
}
.ant-space-compact>button:nth-child(2) {
    border-radius: 0 10px 10px 0 !important;
}
.ant-space-compact button:nth-child(1):hover,.ant-space-compact button:nth-child(2):hover {
    background: #ff5722 !important;
	Color: #fff !important;
}
/* 标题栏模型按钮 */
.ant-dropdown-trigger>span.ant-tag-borderless {
    background: #673AB7;
    border-radius: 6px !important;
    padding: 2px 5px !important;
}
.acss-1jlj8ui .ant-dropdown-trigger>span.ant-tag-borderless {
    background: #673AB7 !important;
}
.acss-1fiv48o .ant-dropdown-trigger>span.ant-tag-borderless {
    background: #99e640 !important;
}
.ant-dropdown-trigger>span.ant-tag-borderless:hover {
    background: #FF5722 !important;
    color: #fff !important;
}
/* 左侧栏搜索框 */
.acss-1jlj8ui .ant-input-affix-wrapper {
    border-radius: 10px;
}
.acss-1fiv48o .ant-input-affix-wrapper {
    border-radius: 10px;
}
.acss-cp5vt4 .ant-tag-borderless {
    background: none !important;
}
/* 助手页hellogpt logo */
a[aria-label="home"]>div {
    position: relative;
}
a[aria-label="home"]>div::before {
    content: 'HelloGPT';
    position: absolute;
    top: 0px;
    left: 0px;
    font-size: 1.7em;
    font-weight: 700;
}
.acss-1jlj8ui a[aria-label="home"]>div::before {
    background: #222;
    color: #fff;
}
.acss-1fiv48o a[aria-label="home"]>div::before {
    background: #fff;
    color: #111;
}
/* 助手页分类按钮 */
.css-vwb4od {
    justify-content: center;
    margin-top: 10px;
}
/* 浮动窗口时背景虚化颜色 */
.ant-modal-root .ant-modal-mask {
    background-color: rgb(60 60 60 / 44%) !important;
}
/* 提示按钮 */
.ant-tooltip-content .ant-tooltip-inner {
    border-radius: 20px !important;
    background: #000000 !important;
    color: #fff !important;
    padding: 15px !important;
}
/* 弹出框ul */
ul.ant-dropdown-menu,.ant-modal-content {
    border: 0 !important;
    border-radius: 0 !important;
	padding: 10px !important;
}
/* body>div>.css-1b46tye>ul {
	background: #333 !important;
}
body>div>.css-leu2ok>ul {
	background: #fff !important;
} */
/* 弹出框li */
.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item, .ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-item, .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-submenu-title, .ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-submenu-title {
    border-radius: 10px !important;
    margin: 6px 0 !important;
}
.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item:hover, .ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-item:hover, .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-submenu-title:hover, .ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-submenu-title:hover, .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item-active, .ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-item-active, .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-submenu-title-active, .ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-submenu-title-active {
    background-color: rgb(0 0 0 / 12%) !important;
}
/* 删除 */
a[href="https://github.com/lobehub/lobe-chat"] {
  display: none !important;
}
.layoutkit-flexbox.css-fr78qt a:last-child {
	display: none !important;
}
.layoutkit-center>form:first-child>div>div>.ant-collapse-content>div>div:nth-child(n+10) {
	display: none !important;
}
#lobe-market-container .acss-1jn2ou {
    display: none;
}
.ant-dropdown-placement-topLeft>ul.ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical.ant-dropdown-menu-light>li:nth-child(n+4):nth-child(-n+8) {
	display: none !important;
}
/* 欢迎页面删除 */
body>div>div:nth-child(1)>div:nth-child(2)>div:nth-child(2)>div:nth-child(2)>div:nth-child(2) {
    display: none;
}
body>div>div:nth-child(1)>div:nth-child(2)>div:nth-child(2)>svg {
    display: none;
}
/* 删除大家都在问 */
.css-1txg53k {
    display: none !important;
}
/* 删除随便聊聊 */
a[aria-label="随便聊聊"] {
    display: none !important;
}
/* 欢迎页面背景色 */
body>div>div:nth-child(1)>div:nth-child(2)>div:nth-child(2) {
	background: none !important;
}
/* 欢迎页面logo */
body>div>div:nth-child(1)>div:nth-child(2)>div:nth-child(2)>div:nth-child(2) strong {
    position: relative;
}
body>div>div:nth-child(1)>div:nth-child(2)>div:nth-child(2)>div:nth-child(2) strong::before {
    content: 'HelloGPT';
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    font-size: 53px;
    font-weight: 700;
}
body>div>.acss-1jlj8ui >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) strong::before {
    background: #222;
	color: #fff !important;
}
body>div>.acss-1fiv48o>div:nth-child(2)>div:nth-child(2)>div:nth-child(2) strong::before {
    background: #fff;
	color: #000 !important;
}
body>div>div:nth-child(1)>div:nth-child(2)>div:nth-child(2)>div:nth-child(2) ol li strong::before {
    display: none
}
/* HelloGPT */
.HelloGPT {
	z-index: 20;
    margin: 0 auto;
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    width: calc(80% - 54px);
    position: relative;
	align-items: center;
}
.HelloGPT::before {
    content: "";
    position: absolute;
    top: 9px;
    bottom: 0;
    left: -9px;
    right: -9px;
    z-index: -1;
}
.HelloGPT h1 {
    margin: 0;
    width: 296px;
    text-align: center;
	position: relative;
	left: -26px;
}
.HelloGPT h1 img {
    width: 138px;
}
.HelloGPT h1::before {
content: "";
    background: #000;
    position: absolute;
    top: 6px;
    bottom: 4px;
    left: 64px;
    right: 64px;
    margin: 0px;
    z-index: -1;
}
.HelloGPT h1::after {
content: "";
    background: #000;
    position: absolute;
    top: 2px;
    bottom: 0px;
    left: 68px;
    right: 68px;
    z-index: -1;
}
.HelloGPT ul {
    list-style: none;
    padding: 0;
    margin: 0;
	margin-right: 40px;
}
.HelloGPT li {
    float: left;
    position: relative;
	margin-left: 10px;
}
.HelloGPT li a {
    color: #fff;
    padding: 4px 12px;
    display: grid;
    align-items: center;
    justify-content: center;
}
.HelloGPT li:hover a {
    color: #fff;
}
.HelloGPT li::before {
    content: "";
    position: absolute;
    top: -4px;
    bottom: -4px;
    left: 4px;
    right: 4px;
    opacity: 1;
    z-index: -1;
    background: #673AB7;
}
.HelloGPT li::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 1;
    z-index: -1;
    background: #673AB7;
}
.HelloGPT li:hover::after, .HelloGPT li:hover::before {
    opacity: 1;
}

/* HelloGPT黑 */
.acss-1jlj8ui .HelloGPT {
    background: #222;
	border-bottom: 1px solid #333333;
}
.acss-1jlj8ui .HelloGPT::before {
    background: #222;
}
.acss-1jlj8ui .HelloGPT li:hover::after, .acss-1jlj8ui .HelloGPT li:hover::before {
    background: #FF5722;
}
.acss-1jlj8ui .HelloGPT li:hover a {
    color: #000;
}
/* HelloGPT白 */
.acss-1fiv48o .HelloGPT {
    background: #fbfbfb;
	border-bottom: 1px solid #dddddd;
}
.acss-1fiv48o .HelloGPT::before {
    background: #fbfbfb;
}
.acss-1fiv48o .HelloGPT li:hover::after, .acss-1fiv48o .HelloGPT li:hover::before {
    background: #000;
}
.acss-1fiv48o .HelloGPT li:hover a {
    color: #fff;
}	

@media (max-width: 575px) {
	.acss-1jlj8ui {
		background: none !important;
	}
	.HelloGPT {
		display: none !important;
	}
}

  
`;
