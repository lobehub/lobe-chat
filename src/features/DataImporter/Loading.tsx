'use client';

import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => {
  const size = 28;

  return {
    loader: css`
      transform: translateX(-${size * 2}px);

      aspect-ratio: 1;
      width: 6px;

      color: ${token.colorPrimary};

      border-radius: 50%;
      box-shadow:
        ${size}px -${size}px 0 0,
        ${size * 2}px -${size}px 0 0,
        ${size * 3}px -${size}px 0 0,
        ${size}px 0 0 5px,
        ${size * 2}px 0 0 5px,
        ${size * 3}px 0 0 5px,
        ${size}px ${size}px 0 0,
        ${size * 2}px ${size}px 0 0,
        ${size * 3}px ${size}px 0 0;

      animation: loading 2s infinite linear;

      @keyframes loading {
        12.5% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 0,
            ${size * 3}px -${size}px 0 5px,
            ${size}px 0 0 5px,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 5px,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 0;
        }

        25% {
          box-shadow:
            ${size}px -${size}px 0 5px,
            ${size * 2}px -${size}px 0 0,
            ${size * 3}px -${size}px 0 5px,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 5px,
            ${size * 3}px ${size}px 0 0;
        }

        50% {
          box-shadow:
            ${size}px -${size}px 0 5px,
            ${size * 2}px -${size}px 0 5px,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 5px;
        }

        62.5% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 0,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 5px,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 5px,
            ${size * 3}px ${size}px 0 5px;
        }

        75% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 5px,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 0,
            ${size * 3}px 0 0 5px,
            ${size}px ${size}px 0 0,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 5px;
        }

        87.5% {
          box-shadow:
            ${size}px -${size}px 0 0,
            ${size * 2}px -${size}px 0 5px,
            ${size * 3}px -${size}px 0 0,
            ${size}px 0 0 0,
            ${size * 2}px 0 0 5px,
            ${size * 3}px 0 0 0,
            ${size}px ${size}px 0 5px,
            ${size * 2}px ${size}px 0 0,
            ${size * 3}px ${size}px 0 0;
        }
      }
    `,
  };
});

const DataLoading = memo(() => {
  const { styles } = useStyles();
  return (
    <Center style={{ height: 80 }}>
      <div className={styles.loader} />
    </Center>
  );
});

export default DataLoading;
