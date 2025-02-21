import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }, borderWidth: number = 2.5) => ({
  background: css`
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    position: absolute;
    inset: 0;
    mask: radial-gradient(farthest-side, #0000 calc(100% - ${borderWidth}px), #000 0);

    background: ${token.colorFill};
  `,
  container: css`
    position: relative;
    width: 13px;
    height: 13px;
  `,

  loader: css`
    width: 100%;
    position: absolute;
    inset: 0;
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      radial-gradient(farthest-side,${token.colorTextSecondary} 94%,#0000) top/${borderWidth}px ${borderWidth}px no-repeat,
      conic-gradient(#0000 50%,${token.colorTextSecondary});
    mask: radial-gradient(farthest-side,#0000 calc(100% - ${borderWidth}px),#000 0);
    animation: smallLoaderAnim  1s infinite linear;
  }

  @keyframes smallLoaderAnim {
    100%{transform: rotate(1turn)}
  }
  `,
}));

const Loader = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.loader} />
      <div className={styles.background} />
    </div>
  );
};

export default Loader;
