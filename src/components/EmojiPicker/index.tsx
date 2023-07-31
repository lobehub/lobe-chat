import data from '@emoji-mart/data';
import i18n from '@emoji-mart/data/i18n/zh.json';
import Picker from '@emoji-mart/react';
import { Avatar } from '@lobehub/ui';
import { Popover } from 'antd';
import { memo } from 'react';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR } from '@/const/meta';

import { useStyles } from './style';

export interface EmojiPickerProps {
  avatar?: string;
  backgroundColor?: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker = memo<EmojiPickerProps>(
  ({ avatar = DEFAULT_AVATAR, backgroundColor = DEFAULT_BACKGROUND_COLOR, onChange }) => {
    const { styles } = useStyles();

    return (
      <Popover
        content={
          <div className={styles.picker}>
            <Picker
              data={data}
              i18n={i18n}
              locale={'zh'}
              onEmojiSelect={(e: any) => onChange(e.native)}
              skinTonePosition={'none'}
              theme={'auto'}
            />
          </div>
        }
        placement={'left'}
        rootClassName={styles.popover}
        trigger={'click'}
      >
        <div className={styles.avatar} style={{ width: 'fit-content' }}>
          <Avatar avatar={avatar} background={backgroundColor} size={44} />
        </div>
      </Popover>
    );
  },
);

export default EmojiPicker;
