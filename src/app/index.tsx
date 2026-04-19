import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/app/_providers';
import { Board } from '@/components/Board';
import { Keyboard } from '@/components/Keyboard';
import { Modal } from '@/components/Modal';
import { AdBanner } from '@/components/AdBanner';
import { AchievementToast } from '@/components/AchievementToast';
import { Toast } from '@/components/Toast';
import { useGame } from '@/hooks/useGame';
import { saveDailyResult } from '@/utils/supabase';

export default function GameScreen() {
  const ctx = useAppContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [finishPayload, setFinishPayload] = useState<{
    solved: boolean;
    word: string;
    attempts: number | null;
  } | null>(null);

  const onFinish = useCallback(
    async ({
      solved,
      attempts,
      yellowCount,
      word,
      stats,
    }: {
      solved: boolean;
      attempts: number | null;
      yellowCount: number;
      word: string;
      stats: import('@/utils/storage').StoredStats;
    }) => {
      setFinishPayload({ solved, word, attempts });
      setEndModalVisible(true);
      // Sync to Supabase if signed in.
      if (ctx.auth.user) {
        const todayIso = new Date().toISOString().slice(0, 10);
        await saveDailyResult({
          user_id: ctx.auth.user.id,
          date: todayIso,
          solved,
          attempts,
          word,
        });
      }
      await ctx.achievements.evaluate(stats, {
        solved,
        attempts,
        yellowCount,
      });
      await ctx.ads.recordGameFinished();
    },
    [ctx.auth.user, ctx.achievements, ctx.ads],
  );

  const game = useGame({
    hardMode: ctx.settings.hardMode,
    onFinish,
  });

  const handleRevealLetter = useCallback(async () => {
    const earned = await ctx.ads.showRewarded();
    if (!earned) return;
    const hint = game.revealRandomLetter();
    if (hint) game.showHint(hint);
  }, [ctx.ads, game]);

  // If the screen mounts and the current game is already over, show the modal.
  useEffect(() => {
    if (
      game.state.hydrated &&
      game.state.status !== 'playing' &&
      finishPayload == null
    ) {
      setFinishPayload({
        solved: game.state.status === 'won',
        word: game.state.solutionTokens.join(''),
        attempts:
          game.state.status === 'won'
            ? game.state.submittedGuesses.length
            : null,
      });
      setEndModalVisible(true);
    }
  }, [game.state, finishPayload]);

  return (
    <View style={[styles.root, { backgroundColor: ctx.theme.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: ctx.theme.text }]}>
          {ctx.t('appName')}
        </Text>
        <View style={styles.topActions}>
          <TopBarButton
            label="🏆"
            onPress={() => router.push('/leaderboard')}
            theme={ctx.theme}
          />
          <TopBarButton
            label="👤"
            onPress={() => router.push('/profile')}
            theme={ctx.theme}
          />
          <TopBarButton
            label="⚙"
            onPress={() => router.push('/settings')}
            theme={ctx.theme}
          />
        </View>
      </View>

      <Toast
        message={game.state.toast?.message ?? null}
        id={game.state.toast?.id ?? null}
        theme={ctx.theme}
      />

      <View style={styles.boardWrap}>
        <Board
          submittedGuesses={game.state.submittedGuesses}
          currentInputTokens={game.state.currentInputTokens}
          theme={ctx.theme}
          shake={game.state.shake}
          status={game.state.status}
        />
      </View>

      {!ctx.ads.isAdFree &&
        game.state.submittedGuesses.length >= 3 &&
        game.state.status === 'playing' && (
          <Pressable
            onPress={() => { void handleRevealLetter(); }}
            style={({ pressed }) => [
              styles.hintBtn,
              { backgroundColor: ctx.theme.keyDefault, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.hintBtnText, { color: ctx.theme.keyText }]}>
              Harfni ochish 🎁
            </Text>
          </Pressable>
        )}

      <Keyboard
        theme={ctx.theme}
        letterStates={game.state.letterStates}
        onLetter={game.pressLetter}
        onBackspace={game.pressBackspace}
        onEnter={game.pressEnter}
        disabled={game.state.status !== 'playing'}
      />

      <AdBanner unitId={ctx.ads.bannerUnitId} isAdFree={ctx.ads.isAdFree} />

      <AchievementToast
        achievement={ctx.achievements.toast}
        onDismiss={ctx.achievements.dismissToast}
        theme={ctx.theme}
      />

      <Modal
        visible={endModalVisible}
        onRequestClose={() => setEndModalVisible(false)}
        theme={ctx.theme}
      >
        <Text style={[styles.modalTitle, { color: ctx.theme.text }]}>
          {finishPayload?.solved ? ctx.t('youWon') : ctx.t('lose')}
        </Text>
        <Text style={[styles.modalBody, { color: ctx.theme.textMuted }]}>
          {ctx.t('theWordWas')}{' '}
          <Text style={{ color: ctx.theme.text, fontWeight: '700' }}>
            {finishPayload?.word.toUpperCase()}
          </Text>
        </Text>
        {finishPayload?.attempts != null && (
          <Text style={{ color: ctx.theme.textMuted }}>
            {finishPayload.attempts} / 6
          </Text>
        )}
        <Text style={[styles.modalBody, { color: ctx.theme.textMuted }]}>
          {ctx.t('tryAgainTomorrow')}
        </Text>
        <View style={styles.modalRow}>
          <Pressable
            onPress={() => router.push('/leaderboard')}
            style={[styles.modalBtn, { borderColor: ctx.theme.border }]}
          >
            <Text style={{ color: ctx.theme.text, fontWeight: '600' }}>
              {ctx.t('leaderboard')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setEndModalVisible(false)}
            style={[
              styles.modalBtn,
              { backgroundColor: ctx.theme.accent, borderColor: ctx.theme.accent },
            ]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>OK</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function TopBarButton({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: import('@/constants/colors').ThemeTokens;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        { borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={{ color: theme.text, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  hintBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  hintBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
