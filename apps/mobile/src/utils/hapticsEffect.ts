import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics/src/Haptics.types';

export const hapticsEffect = (style: ImpactFeedbackStyle = ImpactFeedbackStyle.Light) => {
  try {
    void Haptics.impactAsync(style);
  } catch (e) {
    console.error(e);
  }
};
