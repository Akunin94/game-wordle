import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Achievement } from '@/data/achievements';
import type { ThemeTokens } from '@/constants/colors';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  theme: ThemeTokens;
}

export function AchievementToast({
  achievement,
  onDismiss,
  theme,
}: AchievementToastProps) {
  const translate = useRef(new Animated.Value(-120)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!achievement) return;
    translate.setValue(-120);
    Animated.spring(translate, {
      toValue: 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
    const h = setTimeout(() => {
      Animated.timing(translate, {
        toValue: -160,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }, 2600);
    return () => clearTimeout(h);
  }, [achievement, translate]);

  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          top: insets.top + 8,
          transform: [{ translateY: translate }],
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onDismiss}
        style={[
          styles.toast,
          { backgroundColor: theme.toast, borderColor: theme.border },
        ]}
      >
        <Text style={styles.icon}>{achievement.icon}</Text>
        <Text style={[styles.label, { color: theme.toastText }]} numberOfLines={1}>
          {achievement.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 320,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
  },
});
