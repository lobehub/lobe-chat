import { Swatches, primaryColorsSwatches } from '@lobehub/ui';
import { memo } from 'react';

import { DEFAULT_BACKGROUND_COLOR } from '@/const/meta';

interface BackgroundSwatchesProps {
  backgroundColor?: string;
  onChange: (color: string) => void;
}

const BackgroundSwatches = memo<BackgroundSwatchesProps>(
  ({ backgroundColor = DEFAULT_BACKGROUND_COLOR, onChange }) => {
    const handleSelect = (v: any) => {
      onChange(v || DEFAULT_BACKGROUND_COLOR);
    };

    return (
      <Swatches
        activeColor={backgroundColor}
        colors={primaryColorsSwatches}
        onSelect={handleSelect}
      />
    );
  },
);

export default BackgroundSwatches;
