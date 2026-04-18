import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MAX_ATTEMPTS, WORD_LENGTH } from '@/utils/gameLogic';
import type { ThemeTokens } from '@/constants/colors';
import { Row } from './Row';
import type { GuessRow } from '@/hooks/useGame';

interface BoardProps {
  submittedGuesses: GuessRow[];
  currentInputTokens: string[];
  theme: ThemeTokens;
  shake: boolean;
  status: 'playing' | 'won' | 'lost';
}

const BoardImpl = ({
  submittedGuesses,
  currentInputTokens,
  theme,
  shake,
  status,
}: BoardProps) => {
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < MAX_ATTEMPTS; r += 1) {
    if (r < submittedGuesses.length) {
      const guess = submittedGuesses[r]!;
      rows.push(
        <Row
          key={`g-${r}`}
          tokens={guess.tokens}
          evals={guess.evals}
          revealed
          theme={theme}
          bouncing={status === 'won' && r === submittedGuesses.length - 1}
        />,
      );
    } else if (r === submittedGuesses.length) {
      // Active row — pad with empties, shake on invalid submit.
      const padded: string[] = [...currentInputTokens];
      while (padded.length < WORD_LENGTH) padded.push('');
      rows.push(
        <Row
          key={`c-${r}`}
          tokens={padded}
          evals={null}
          revealed={false}
          theme={theme}
          shake={shake}
        />,
      );
    } else {
      const empty = new Array<string>(WORD_LENGTH).fill('');
      rows.push(
        <Row
          key={`e-${r}`}
          tokens={empty}
          evals={null}
          revealed={false}
          theme={theme}
        />,
      );
    }
  }
  return <View style={styles.board}>{rows}</View>;
};

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export const Board = memo(BoardImpl);
