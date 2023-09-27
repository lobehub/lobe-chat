import { css } from 'antd-style';

export default () => css`
  html,
  body,
  .ant-app {
    overflow: hidden;
    overscroll-behavior: none;

    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  #__next {
    height: 100%;
  }

  p {
    margin-bottom: 0;
  }
`;
