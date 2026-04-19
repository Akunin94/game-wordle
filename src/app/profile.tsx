import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppContext } from '@/app/_providers';
import { Modal } from '@/components/Modal';
import { Storage, StoredStats, DEFAULT_STATS } from '@/utils/storage';
import { ACHIEVEMENTS, AchievementId } from '@/data/achievements';
import { updateDisplayName } from '@/utils/supabase';

export default function ProfileScreen() {
  const ctx = useAppContext();
  const [stats, setStats] = useState<StoredStats>(DEFAULT_STATS);
  const [editOpen, setEditOpen] = useState(false);
  const [nameInput, setNameInput] = useState(ctx.auth.user?.displayName ?? '');

  useEffect(() => {
    void Storage.getStats().then(setStats);
  }, []);

  useEffect(() => {
    setNameInput(ctx.auth.user?.displayName ?? '');
  }, [ctx.auth.user?.displayName]);

  const winPct = useMemo(() => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }, [stats]);

  const maxBarCount = useMemo(() => {
    let max = 0;
    for (const key of ['1', '2', '3', '4', '5', '6'] as const) {
      if (stats.guessDistribution[key] > max) max = stats.guessDistribution[key];
    }
    return Math.max(1, max);
  }, [stats]);

  const onSaveName = async () => {
    if (!ctx.auth.user) return;
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await updateDisplayName(ctx.auth.user.id, trimmed);
    await ctx.auth.refresh();
    setEditOpen(false);
  };

  if (!ctx.auth.user) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.signInWrap,
          { backgroundColor: ctx.theme.background },
        ]}
      >
        <Text style={[styles.title, { color: ctx.theme.text }]}>
          {ctx.t('signInToSaveProgress')}
        </Text>
        {ctx.auth.canUseApple && (
          <Pressable
            onPress={ctx.auth.signInWithApple}
            style={[styles.authBtn, { backgroundColor: '#000' }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>
               {ctx.t('signInApple')}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={ctx.auth.signInWithGoogle}
          style={[
            styles.authBtn,
            { backgroundColor: '#fff', borderWidth: 1, borderColor: ctx.theme.border },
          ]}
        >
          <Text style={{ color: '#1A1A1B', fontWeight: '700' }}>
            {ctx.t('signInGoogle')}
          </Text>
        </Pressable>
        <Text style={{ color: ctx.theme.textMuted, textAlign: 'center' }}>
          {ctx.t('playOffline')} — {ctx.t('stats')}:
        </Text>
        <StatsCard stats={stats} theme={ctx.theme} winPct={winPct} t={ctx.t} />
        <AchievementsGrid
          theme={ctx.theme}
          unlocked={ctx.achievements.unlocked}
          t={ctx.t}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: ctx.theme.background },
      ]}
    >
      <View style={styles.header}>
        {ctx.auth.user.avatarUrl ? (
          <Image
            source={{ uri: ctx.auth.user.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: ctx.theme.surface,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '800',
                color: ctx.theme.textMuted,
              }}
            >
              {ctx.auth.user.displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.name, { color: ctx.theme.text }]}>
          {ctx.auth.user.displayName}
        </Text>
        <Pressable onPress={() => setEditOpen(true)}>
          <Text style={{ color: ctx.theme.accent }}>{ctx.t('editName')}</Text>
        </Pressable>
      </View>

      <StatsCard stats={stats} theme={ctx.theme} winPct={winPct} t={ctx.t} />

      <SectionTitle title={ctx.t('guessDistribution')} theme={ctx.theme} />
      <View style={styles.distWrap}>
        {(['1', '2', '3', '4', '5', '6'] as const).map((key) => (
          <View style={styles.distRow} key={key}>
            <Text
              style={{ color: ctx.theme.textMuted, width: 18, textAlign: 'center' }}
            >
              {key}
            </Text>
            <View
              style={[
                styles.distBarBg,
                { backgroundColor: ctx.theme.surface },
              ]}
            >
              <View
                style={[
                  styles.distBar,
                  {
                    backgroundColor: ctx.theme.correct,
                    width: `${(stats.guessDistribution[key] / maxBarCount) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text
              style={{ color: ctx.theme.text, width: 36, textAlign: 'right' }}
            >
              {stats.guessDistribution[key]}
            </Text>
          </View>
        ))}
      </View>

      <AchievementsGrid
        theme={ctx.theme}
        unlocked={ctx.achievements.unlocked}
        t={ctx.t}
      />

      {!ctx.ads.isAdFree && ctx.purchase.product && (
        <Pressable
          onPress={ctx.purchase.purchaseRemoveAds}
          style={[styles.primaryBtn, { backgroundColor: ctx.theme.accent }]}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {ctx.t('removeAds')} — {ctx.purchase.product.priceString}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={ctx.auth.signOut}
        style={[
          styles.dangerBtn,
          { borderColor: ctx.theme.danger },
        ]}
      >
        <Text style={{ color: ctx.theme.danger, fontWeight: '700' }}>
          {ctx.t('signOut')}
        </Text>
      </Pressable>

      <Modal
        visible={editOpen}
        onRequestClose={() => setEditOpen(false)}
        theme={ctx.theme}
      >
        <Text style={[styles.modalTitle, { color: ctx.theme.text }]}>
          {ctx.t('editName')}
        </Text>
        <TextInput
          value={nameInput}
          onChangeText={setNameInput}
          style={[
            styles.input,
            {
              borderColor: ctx.theme.border,
              color: ctx.theme.text,
              backgroundColor: ctx.theme.background,
            },
          ]}
          maxLength={24}
          autoFocus
        />
        <View style={styles.modalRow}>
          <Pressable
            onPress={() => setEditOpen(false)}
            style={[styles.modalBtn, { borderColor: ctx.theme.border }]}
          >
            <Text style={{ color: ctx.theme.text }}>{ctx.t('cancel')}</Text>
          </Pressable>
          <Pressable
            onPress={onSaveName}
            style={[
              styles.modalBtn,
              { backgroundColor: ctx.theme.accent, borderColor: ctx.theme.accent },
            ]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>
              {ctx.t('save')}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SectionTitle({
  title,
  theme,
}: {
  title: string;
  theme: import('@/constants/colors').ThemeTokens;
}) {
  return (
    <Text style={[styles.section, { color: theme.text }]}>{title}</Text>
  );
}

function StatsCard({
  stats,
  winPct,
  theme,
  t,
}: {
  stats: StoredStats;
  winPct: number;
  theme: import('@/constants/colors').ThemeTokens;
  t: (k: 'gamesPlayed' | 'winPct' | 'currentStreak' | 'maxStreak') => string;
}) {
  const items: { label: string; value: number }[] = [
    { label: t('gamesPlayed'), value: stats.gamesPlayed },
    { label: t('winPct'), value: winPct },
    { label: t('currentStreak'), value: stats.currentStreak },
    { label: t('maxStreak'), value: stats.maxStreak },
  ];
  return (
    <View
      style={[
        styles.statsCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {items.map((it) => (
        <View key={it.label} style={styles.stat}>
          <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800' }}>
            {it.value}
          </Text>
          <Text
            style={{ color: theme.textMuted, fontSize: 11, textAlign: 'center' }}
          >
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function AchievementsGrid({
  theme,
  unlocked,
  t,
}: {
  theme: import('@/constants/colors').ThemeTokens;
  unlocked: AchievementId[];
  t: (k: 'achievements' | 'locked') => string;
}) {
  return (
    <>
      <Text style={[styles.section, { color: theme.text }]}>
        {t('achievements')}
      </Text>
      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.includes(a.id);
          return (
            <View
              key={a.id}
              style={[
                styles.achCell,
                {
                  backgroundColor: on ? theme.surface : theme.background,
                  borderColor: theme.border,
                  opacity: on ? 1 : 0.5,
                },
              ]}
            >
              <Text style={styles.achIcon}>{a.icon}</Text>
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '700',
                  fontSize: 12,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {a.label}
              </Text>
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 10,
                  textAlign: 'center',
                }}
                numberOfLines={2}
              >
                {on ? a.desc : t('locked')}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  signInWrap: {
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  stat: { alignItems: 'center', flex: 1 },
  section: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  distWrap: { gap: 6 },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distBarBg: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distBar: {
    height: '100%',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achCell: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    minHeight: 96,
  },
  achIcon: { fontSize: 28 },
  primaryBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  authBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
