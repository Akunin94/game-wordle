import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { ThemeTokens } from '@/constants/colors';

interface ToastProps {
  message: string | null;
  id: number | null;
  theme: ThemeTokens;
}

/**
 * Lightweight transient status toast used by the game screen ("not in word
 * list", "not enough letters"). Distinct from the AchievementToast above.
 */
export function Toast({ message, id, theme }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message == null) {
      opacity.setValue(0);
      return;
    }
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [message, id, opacity]);

  if (message == null) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.toast, opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, { color: theme.toastText }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
    zIndex: 50,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
