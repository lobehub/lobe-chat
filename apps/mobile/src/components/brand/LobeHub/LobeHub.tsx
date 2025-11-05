import React, { type ReactNode, memo, useMemo } from 'react';

import Flexbox from '../../Flexbox';
import Text from '../../Text';
import BrandDivider from '../BrandDivider';
import LobeHubText from '../LobeHubText';
import Logo3d from '../Logo3d';
import LogoFlat from '../LogoFlat';
import LogoMono from '../LogoMono';
import { useStyles } from './style';
import type { LobeHubProps } from './type';

const LobeHub = memo<LobeHubProps>(({ type = '3d', size = 32, style, extra, ...rest }) => {
  const { styles, theme } = useStyles();

  const logoComponent: ReactNode = useMemo(() => {
    switch (type) {
      case '3d': {
        return <Logo3d size={size} {...rest} />;
      }

      case 'flat': {
        return <LogoFlat size={size} style={style} />;
      }

      case 'mono': {
        return <LogoMono size={size} style={style} />;
      }

      case 'text': {
        return <LobeHubText size={size} style={style} />;
      }

      case 'combine': {
        return (
          <Flexbox align="center" gap={Math.round(size / 4)} horizontal>
            <Logo3d size={size} />
            <LobeHubText size={size} />
          </Flexbox>
        );
      }

      default: {
        return <Logo3d size={size} {...rest} />;
      }
    }
  }, [type, size, style, rest]);

  if (!extra) return logoComponent;

  const extraSize = Math.round((size / 3) * 1.9);

  return (
    <Flexbox align="center" gap={0} horizontal style={style} {...rest}>
      {logoComponent}
      <BrandDivider color={theme.colorFill} size={extraSize} style={{ marginHorizontal: 8 }} />
      <Text style={[styles.extraTitle, { fontSize: extraSize }]}>{extra}</Text>
    </Flexbox>
  );
});

LobeHub.displayName = 'LobeHub';

export default LobeHub;
