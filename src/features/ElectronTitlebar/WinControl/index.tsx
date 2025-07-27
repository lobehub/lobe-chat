// const useStyles = createStyles(({ css, cx, token }) => {
//   const icon = css`
//     display: flex;
//     align-items: center;
//     justify-content: center;
//
//     width: ${TITLE_BAR_HEIGHT * 1.2}px;
//     min-height: ${TITLE_BAR_HEIGHT}px;
//
//     color: ${token.colorTextSecondary};
//
//     transition: all ease-in-out 100ms;
//
//     -webkit-app-region: no-drag;
//
//     &:hover {
//       color: ${token.colorText};
//       background: ${token.colorFillTertiary};
//     }
//
//     &:active {
//       color: ${token.colorText};
//       background: ${token.colorFillSecondary};
//     }
//   `;
//   return {
//     close: cx(
//       icon,
//       css`
//         padding-inline-end: 2px;
//
//         &:hover {
//           color: ${token.colorTextLightSolid};
//
//           /* win11 的色值，亮暗色均不变 */
//           background: #d33328;
//         }
//
//         &:active {
//           color: ${token.colorTextLightSolid};
//
//           /* win11 的色值 */
//           background: #8b2b25;
//         }
//       `,
//     ),
//     container: css`
//       cursor: pointer;
//       display: flex;
//     `,
//     icon,
//   };
// });

const WinControl = () => {
  return <div style={{ width: 132 }} />;

  // const { styles } = useStyles();
  //
  // return (
  //   <div className={styles.container}>
  //     <div
  //       className={styles.icon}
  //       onClick={() => {
  //         electronSystemService.minimizeWindow();
  //       }}
  //     >
  //       <Minus absoluteStrokeWidth size={14} strokeWidth={1.2} />
  //     </div>
  //     <div
  //       className={styles.icon}
  //       onClick={() => {
  //         electronSystemService.maximizeWindow();
  //       }}
  //     >
  //       <Square absoluteStrokeWidth size={10} strokeWidth={1.2} />
  //     </div>
  //     <div
  //       className={styles.close}
  //       onClick={() => {
  //         electronSystemService.closeWindow();
  //       }}
  //     >
  //       <XIcon absoluteStrokeWidth size={14} strokeWidth={1.2} />
  //     </div>
  //   </div>
  // );
};

export default WinControl;
