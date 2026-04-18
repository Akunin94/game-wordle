import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { LetterEvaluation } from '@/utils/gameLogic';
import { WORD_LENGTH } from '@/utils/gameLogic';
import type { ThemeTokens } from '@/constants/colors';
import { Tile } from './Tile';

interface RowProps {
  tokens: string[];
  evals: LetterEvaluation[] | null;
  revealed: boolean;
  theme: ThemeTokens;
  shake?: boolean;
  bouncing?: boolean;
}

const RowImpl = ({
  tokens,
  evals,
  revealed,
  theme,
  shake = false,
  bouncing = false,
}: RowProps) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shake) return;
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shake, shakeAnim]);

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const token = tokens[i] ?? '';
    const evaluation = evals?.[i] ?? null;
    cells.push(
      <Tile
        key={i}
        letter={token}
        evaluation={evaluation}
        filled={Boolean(token)}
        flipDelay={i * 240}
        revealed={revealed}
        theme={theme}
        bouncing={bouncing}
        bounceDelay={i * 100}
      />,
    );
  }

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
      {cells}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginVertical: 3,
  },
});

export const Row = memo(RowImpl);
