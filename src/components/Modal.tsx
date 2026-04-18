import { PropsWithChildren, useEffect, useRef } from 'react';
import {
  Animated,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import type { ThemeTokens } from '@/constants/colors';

interface ModalProps {
  visible: boolean;
  onRequestClose: () => void;
  theme: ThemeTokens;
}

export function Modal({
  visible,
  onRequestClose,
  theme,
  children,
}: PropsWithChildren<ModalProps>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      translate.setValue(40);
    }
  }, [visible, opacity, translate]);

  return (
    <RNModal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={styles.dismissArea} onPress={onRequestClose} />
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: [{ translateY: translate }],
            },
          ]}
        >
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '86%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  content: {
    gap: 12,
  },
});
