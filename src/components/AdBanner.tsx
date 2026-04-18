import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  unitId: string;
  isAdFree: boolean;
}

const AdBannerImpl = ({ unitId, isAdFree }: AdBannerProps) => {
  if (isAdFree) return null;
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});

export const AdBanner = memo(AdBannerImpl);
