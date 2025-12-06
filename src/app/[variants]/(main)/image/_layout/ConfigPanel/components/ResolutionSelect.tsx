import { createStyles } from 'antd-style';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 60px;
    height: 32px;
    padding-block: 0;
    padding-inline: 16px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      background: ${token.colorBgTextHover};
    }
  `,

  container: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,

  selectedButton: css`
    border-color: ${token.colorPrimary};
    color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};

    &:hover {
      border-color: ${token.colorPrimary};
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryBgHover};
    }
  `,
}));

const ResolutionSelect = memo(() => {
  const { t } = useTranslation('image');
  const { value, setValue, enumValues } = useGenerationConfigParam('resolution');
  const { styles, cx } = useStyles();

  const handleClick = useCallback(
    (resolution: string) => {
      setValue(resolution);
    },
    [setValue],
  );

  if (!enumValues || enumValues.length === 0) {
    return null;
  }

  return (
    <Flexbox className={styles.container} horizontal>
      {enumValues.map((resolution) => (
        <button
          className={cx(styles.button, value === resolution && styles.selectedButton)}
          key={resolution}
          onClick={() => handleClick(resolution)}
          type="button"
        >
          {t(`config.resolution.options.${resolution}`, { defaultValue: resolution })}
        </button>
      ))}
    </Flexbox>
  );
});

export default ResolutionSelect;
