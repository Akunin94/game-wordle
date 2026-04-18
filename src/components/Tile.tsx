import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { LetterEvaluation } from '@/utils/gameLogic';
import { tileColor, ThemeTokens, TileState } from '@/constants/colors';

interface TileProps {
  letter: string; // letter token — may be "sh", "ch", "ng", "o'", "g'", or a single char
  evaluation: LetterEvaluation | null;
  filled: boolean;
  flipDelay: number; // in milliseconds (for staggered row reveals)
  revealed: boolean; // controls whether the flip should run (for previously saved guesses skip it)
  theme: ThemeTokens;
  bouncing?: boolean;
  bounceDelay?: number;
}

const TileImpl = ({
  letter,
  evaluation,
  filled,
  flipDelay,
  revealed,
  theme,
  bouncing = false,
  bounceDelay = 0,
}: TileProps) => {
  const flip = useRef(new Animated.Value(revealed ? 1 : 0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  // Run the flip animation once whenever the tile becomes "revealed".
  useEffect(() => {
    if (!revealed) {
      flip.setValue(0);
      return;
    }
    flip.setValue(0);
    Animated.sequence([
      Animated.delay(flipDelay),
      Animated.timing(flip, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [revealed, flipDelay, flip]);

  useEffect(() => {
    if (!bouncing) return;
    bounce.setValue(0);
    Animated.sequence([
      Animated.delay(bounceDelay),
      Animated.spring(bounce, {
        toValue: 1,
        friction: 3,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(bounce, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bouncing, bounceDelay, bounce]);

  const evaluated = revealed && evaluation != null;
  const state: TileState = evaluated
    ? evaluation
    : filled
    ? 'filled'
    : 'empty';
  const colors = tileColor(theme, state);

  // Flip interpolation — rotate front face out, back face in at mid-point.
  const frontRotate = flip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });
  const backRotate = flip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  // Pre-revealed tile: render the back face only.
  const preRevealed = revealed;

  const frontColors = tileColor(theme, filled ? 'filled' : 'empty');

  return (
    <Animated.View
      style={[styles.outer, { transform: [{ translateY }] }]}
    >
      {/* Front face — only shown during flip. */}
      {!preRevealed && (
        <Animated.View
          style={[
            styles.face,
            {
              backgroundColor: frontColors.bg,
              borderColor: frontColors.border,
              transform: [{ perspective: 600 }, { rotateX: frontRotate }],
            },
          ]}
        >
          <TileText color={frontColors.text} letter={letter} />
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.face,
          styles.backFace,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            transform: [{ perspective: 600 }, { rotateX: backRotate }],
          },
        ]}
      >
        <TileText color={colors.text} letter={letter} />
      </Animated.View>
      {/* Fallback layer so layout measures correctly. */}
      <View style={styles.placeholder} />
    </Animated.View>
  );
};

function TileText({ color, letter }: { color: string; letter: string }) {
  // Render digraphs more compactly so they fit within the tile.
  const display = letter.length > 1 ? letter[0]!.toUpperCase() + letter.slice(1) : letter.toUpperCase();
  const fontSize = letter.length > 1 ? 22 : 28;
  return (
    <Animated.Text style={[styles.letter, { color, fontSize }]}>{display}</Animated.Text>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 56,
    height: 56,
  },
  placeholder: {
    width: 56,
    height: 56,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  backFace: {
    // Rendered on top when flip completes.
  },
  letter: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export const Tile = memo(TileImpl);
