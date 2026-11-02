import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import { ArmoryGrid } from './src/components/ArmoryGrid';
import { HeroAvatarHUD } from './src/components/HeroAvatarHUD';
import { ReduxLiveInspector } from './src/components/ReduxLiveInspector';
import { StatsControlPanel } from './src/components/StatsControlPanel';
import { store } from './src/store';
import { RPG_THEME } from './src/theme/rpgTheme';

/**
 * Pantalla principal compuesta por las 4 Zonas Visuales Independientes.
 * Cero prop drilling: los 4 componentes son hermanos y no reciben props entre sí,
 * alimentándose exclusivamente del Redux Store.
 */
export const HeroForgeScreen: React.FC = () => {
  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera de la Aplicación */}
        <View style={styles.appHeader}>
          <View style={styles.headerBadgeRow}>
            <Text style={styles.headerBadge}>
              ⚔️ UNIVERSIDAD DE LA SABANA  DESARROLLO MÓVIL
            </Text>
          </View>
          <Text style={styles.appTitle}>HERO FORGE RPG</Text>
          <Text style={styles.appSubtitle}>
            Arquitectura de Estado Visual con Redux Toolkit • Efecto Dominó en 4
            Zonas Independientes
          </Text>
        </View>

        {/* 4 Zonas Visuales Independientes (Cero Prop Drilling) */}
        <HeroAvatarHUD />
        <StatsControlPanel />
        <ArmoryGrid />
        <ReduxLiveInspector />
      </ScrollView>
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <HeroForgeScreen />
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: RPG_THEME.colors.bgMidnight,
  },
  scrollContent: {
    paddingHorizontal: RPG_THEME.spacing.md,
    paddingTop: RPG_THEME.spacing.md,
    paddingBottom: RPG_THEME.spacing.xl,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  appHeader: {
    backgroundColor: RPG_THEME.colors.cardGraphite,
    borderRadius: RPG_THEME.radius.lg,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.goldPrimary,
    padding: RPG_THEME.spacing.lg,
    marginBottom: RPG_THEME.spacing.lg,
    alignItems: 'center',
  },
  headerBadgeRow: {
    backgroundColor: RPG_THEME.colors.goldMuted,
    borderColor: RPG_THEME.colors.goldPrimary,
    borderWidth: 1,
    borderRadius: RPG_THEME.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  headerBadge: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  appTitle: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  appSubtitle: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
});
