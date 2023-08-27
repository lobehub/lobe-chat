import data from '@emoji-mart/data';
import i18n from '@emoji-mart/data/i18n/zh.json';
import Picker from '@emoji-mart/react';
import { Avatar } from '@lobehub/ui';
import { Popover } from 'antd';
import { memo } from 'react';
import useMergeState from 'use-merge-value';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR } from '@/const/meta';

import { useStyles } from './style';

export interface EmojiPickerProps {
  backgroundColor?: string;
  defaultAvatar?: string;
  onChange?: (emoji: string) => void;
  value?: string;
}

const EmojiPicker = memo<EmojiPickerProps>(
  ({ value, defaultAvatar, backgroundColor = DEFAULT_BACKGROUND_COLOR, onChange }) => {
    const { styles } = useStyles();

    const [ava, setAva] = useMergeState(DEFAULT_AVATAR, {
      defaultValue: defaultAvatar,
      onChange,
      value,
    });

    return (
      <Popover
        content={
          <div className={styles.picker}>
            <Picker
              data={data}
              i18n={i18n}
              locale={'zh'}
              onEmojiSelect={(e: any) => setAva(e.native)}
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
          <Avatar avatar={ava} background={backgroundColor} size={44} />
        </div>
      </Popover>
    );
  },
);

export default EmojiPicker;
