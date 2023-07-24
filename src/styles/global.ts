import { css } from 'antd-style';

export default () => css`
  body,
  .ant-app {
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
