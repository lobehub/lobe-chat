import { Link } from 'expo-router';
import { Sparkles, CompassIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ICON_SIZE } from '@/const/common';
import { useStyles } from './style';

const SessionHeader: React.FC = () => {
  const { styles, token } = useStyles();

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>LobeChat</Text>
      <View style={styles.extra}>
        <Link asChild href="/(playground)">
          <TouchableOpacity style={styles.settingButton}>
            <Sparkles color={token.colorText} size={ICON_SIZE} />
          </TouchableOpacity>
        </Link>
        <Link asChild href="/assistant/list">
          <TouchableOpacity style={styles.settingButton}>
            <CompassIcon color={token.colorText} size={ICON_SIZE} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default SessionHeader;
