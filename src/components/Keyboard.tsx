import { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { KEYBOARD_LAYOUT, KeyAction } from '@/constants/keyboard';
import { ThemeTokens, tileColor } from '@/constants/colors';

interface KeyboardProps {
  theme: ThemeTokens;
  letterStates: Record<string, 'correct' | 'present' | 'absent'>;
  onLetter: (token: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

const KeyboardImpl = ({
  theme,
  letterStates,
  onLetter,
  onBackspace,
  onEnter,
  disabled,
}: KeyboardProps) => {
  return (
    <View style={styles.root}>
      {KEYBOARD_LAYOUT.map((row, ri) => (
        <View style={styles.row} key={`r-${ri}`}>
          {row.map((key, ki) => (
            <Key
              // eslint-disable-next-line react/no-array-index-key
              key={`k-${ri}-${ki}`}
              action={key}
              theme={theme}
              state={key.kind === 'letter' ? letterStates[key.value] : undefined}
              disabled={disabled ?? false}
              onLetter={onLetter}
              onEnter={onEnter}
              onBackspace={onBackspace}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

interface KeyProps {
  action: KeyAction;
  theme: ThemeTokens;
  state: 'correct' | 'present' | 'absent' | undefined;
  disabled: boolean;
  onLetter: (token: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

function Key({
  action,
  theme,
  state,
  disabled,
  onLetter,
  onEnter,
  onBackspace,
}: KeyProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const stateRef = useRef(state);

  useEffect(() => {
    if (stateRef.current !== state) {
      stateRef.current = state;
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
  }, [state, anim]);

  let bg = theme.keyDefault;
  let textColor = theme.keyText;
  if (state) {
    const c = tileColor(theme, state);
    bg = c.bg;
    textColor = c.text;
  }

  let label = '';
  let flex = 1;
  if (action.kind === 'letter') {
    label = action.display;
    if (action.value.length > 1) flex = 1.1; // digraphs get a bit more space
  } else if (action.kind === 'enter') {
    label = '↵';
    flex = 1.6;
  } else {
    label = '⌫';
    flex = 1.6;
  }

  const onPress = () => {
    if (disabled) return;
    if (action.kind === 'letter') onLetter(action.value);
    else if (action.kind === 'enter') onEnter();
    else onBackspace();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.key,
        { flex, backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.keyText, { color: textColor }]}>{label}</Text>
      <Animated.View style={{ width: 0, height: 0, opacity: anim }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    gap: 4,
  },
  key: {
    height: 48,
    minWidth: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontWeight: '700',
    fontSize: 15,
  },
});

export const Keyboard = memo(KeyboardImpl);
