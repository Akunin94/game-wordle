import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppContext } from '@/app/_providers';
import type { Locale } from '@/utils/i18n';

export default function SettingsScreen() {
  const ctx = useAppContext();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: ctx.theme.background },
      ]}
    >
      <Row
        label={ctx.t('darkMode')}
        right={
          <Switch
            value={ctx.isDark}
            onValueChange={(v) => ctx.setDarkMode(v ? true : false)}
          />
        }
        theme={ctx.theme}
      />
      <Row
        label={ctx.t('colorblind')}
        right={
          <Switch
            value={ctx.settings.colorblind}
            onValueChange={ctx.setColorblind}
          />
        }
        theme={ctx.theme}
      />
      <Row
        label={ctx.t('hardMode')}
        right={
          <Switch
            value={ctx.settings.hardMode}
            onValueChange={ctx.setHardMode}
          />
        }
        theme={ctx.theme}
      />

      <Text style={[styles.section, { color: ctx.theme.textMuted }]}>
        {ctx.t('language')}
      </Text>
      <View style={styles.langRow}>
        {(['uz', 'ru', 'en'] as const).map((code) => (
          <LangPill
            key={code}
            code={code}
            active={ctx.locale === code}
            onPress={() => ctx.setLanguage(code)}
            theme={ctx.theme}
          />
        ))}
      </View>

      {!ctx.ads.isAdFree && (
        <Pressable
          onPress={ctx.purchase.purchaseRemoveAds}
          style={[styles.primaryBtn, { backgroundColor: ctx.theme.accent }]}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {ctx.t('removeAds')}
            {ctx.purchase.product ? ` — ${ctx.purchase.product.priceString}` : ''}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={ctx.purchase.restorePurchases}
        style={[
          styles.secondaryBtn,
          { borderColor: ctx.theme.border },
        ]}
      >
        <Text style={{ color: ctx.theme.text, fontWeight: '600' }}>
          {ctx.t('restorePurchases')}
        </Text>
      </Pressable>

      {ctx.purchase.status === 'success' && (
        <Text style={{ color: ctx.theme.correct, textAlign: 'center' }}>
          ✓ {ctx.t('adFreePurchased')}
        </Text>
      )}
      {ctx.purchase.status === 'restored' && (
        <Text style={{ color: ctx.theme.correct, textAlign: 'center' }}>
          ✓ {ctx.t('adFreeRestored')}
        </Text>
      )}
      {ctx.purchase.status === 'error' && ctx.purchase.error && (
        <Text style={{ color: ctx.theme.danger, textAlign: 'center' }}>
          {ctx.t('purchaseFailed')}: {ctx.purchase.error}
        </Text>
      )}

      <Text style={[styles.section, { color: ctx.theme.textMuted }]}>
        {ctx.t('howToPlay')}
      </Text>
      <Text style={{ color: ctx.theme.text, lineHeight: 22 }}>
        • 6 urinishda 5 harfli oʻzbek soʻzini toping.{'\n'}
        • Har bir urinishdan soʻng harflar ranglanadi:{'\n'}
        {'  '}🟩 toʻgʻri harf, toʻgʻri oʻrinda{'\n'}
        {'  '}🟨 toʻgʻri harf, notoʻgʻri oʻrinda{'\n'}
        {'  '}⬛ soʻzda yoʻq harf{'\n'}
        • Har kuni barcha oʻyinchilar uchun bitta soʻz.{'\n'}
      </Text>
    </ScrollView>
  );
}

function Row({
  label,
  right,
  theme,
}: {
  label: string;
  right: React.ReactNode;
  theme: import('@/constants/colors').ThemeTokens;
}) {
  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>{label}</Text>
      {right}
    </View>
  );
}

function LangPill({
  code,
  active,
  onPress,
  theme,
}: {
  code: Locale;
  active: boolean;
  onPress: () => void;
  theme: import('@/constants/colors').ThemeTokens;
}) {
  const label = code === 'uz' ? 'Oʻzbek' : code === 'ru' ? 'Русский' : 'English';
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? theme.accent : 'transparent',
          borderColor: active ? theme.accent : theme.border,
        },
      ]}
    >
      <Text
        style={{
          color: active ? '#fff' : theme.text,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  primaryBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
});
