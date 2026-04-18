import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAppContext } from '@/app/_providers';
import {
  fetchLeaderboard,
  fetchMyRank,
  LeaderboardRow,
} from '@/utils/supabase';

const PAGE_SIZE = 20;
const TOTAL_LIMIT = 100;

export default function LeaderboardScreen() {
  const ctx = useAppContext();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      const { rows: next, hasMore: more } = await fetchLeaderboard(
        pageToLoad,
        PAGE_SIZE,
      );
      setRows((prev) => {
        const combined = replace ? next : [...prev, ...next];
        return combined.slice(0, TOTAL_LIMIT);
      });
      setHasMore(more && (pageToLoad + 1) * PAGE_SIZE < TOTAL_LIMIT);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    await loadPage(0, true);
    if (ctx.auth.user) {
      const r = await fetchMyRank(ctx.auth.user.id);
      setMyRank(r);
    } else {
      setMyRank(null);
    }
    setRefreshing(false);
    setLoading(false);
  }, [loadPage, ctx.auth.user]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    // First-time load indicator.
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await loadPage(next, false);
  }, [hasMore, loading, page, loadPage]);

  const myIndex = useMemo(() => {
    if (!ctx.auth.user) return -1;
    return rows.findIndex((r) => r.user_id === ctx.auth.user?.id);
  }, [rows, ctx.auth.user]);

  if (!ctx.auth.user) {
    return (
      <View style={[styles.center, { backgroundColor: ctx.theme.background }]}>
        <Text style={[styles.muted, { color: ctx.theme.textMuted }]}>
          {ctx.t('signInToSeeLeaderboard')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: ctx.theme.background }]}>
      {myRank != null && (
        <View style={[styles.myRankBar, { borderColor: ctx.theme.border }]}>
          <Text style={{ color: ctx.theme.text, fontWeight: '700' }}>
            {ctx.t('myRank')}: #{myRank}
          </Text>
          {myIndex >= 0 && (
            <Pressable
              onPress={() => {
                /* FlatList has no scrollToIndex here; kept as visual highlight */
              }}
            >
              <Text style={{ color: ctx.theme.accent }}>↓</Text>
            </Pressable>
          )}
        </View>
      )}
      {loading && rows.length === 0 ? (
        <LeaderboardSkeleton theme={ctx.theme} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.user_id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <Text style={[styles.muted, { color: ctx.theme.textMuted }]}>
              {ctx.t('noData')}
            </Text>
          }
          renderItem={({ item, index }) => (
            <Row
              item={item}
              rank={index + 1}
              highlighted={item.user_id === ctx.auth.user?.id}
              theme={ctx.theme}
            />
          )}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={ctx.theme.accent} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

function Row({
  item,
  rank,
  highlighted,
  theme,
}: {
  item: LeaderboardRow;
  rank: number;
  highlighted: boolean;
  theme: import('@/constants/colors').ThemeTokens;
}) {
  return (
    <View
      style={[
        styles.row,
        {
          borderColor: theme.border,
          backgroundColor: highlighted ? theme.surface : 'transparent',
        },
      ]}
    >
      <Text style={[styles.rank, { color: theme.textMuted }]}>#{rank}</Text>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.avatarFallback,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text style={{ color: theme.textMuted }}>
            {item.display_name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
        {item.display_name}
      </Text>
      <View style={styles.stats}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>
          {item.total_wins}
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>
          🔥 {item.max_streak}
        </Text>
      </View>
    </View>
  );
}

function LeaderboardSkeleton({
  theme,
}: {
  theme: import('@/constants/colors').ThemeTokens;
}) {
  return (
    <View>
      {Array.from({ length: 10 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <View key={i} style={[styles.row, { borderColor: theme.border }]}>
          <View
            style={[
              styles.skeletonSm,
              { backgroundColor: theme.surface },
            ]}
          />
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.surface },
            ]}
          />
          <View
            style={[
              styles.skeletonBar,
              { backgroundColor: theme.surface, flex: 1 },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { padding: 24, textAlign: 'center' },
  myRankBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  rank: {
    width: 40,
    fontWeight: '600',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  stats: { alignItems: 'flex-end' },
  footer: { paddingVertical: 20 },
  skeletonSm: { width: 40, height: 16, borderRadius: 4 },
  skeletonBar: { height: 16, borderRadius: 4 },
});
