import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectStatsSlice, selectTotalStats } from '../store/selectors';
import {
  applyBuildPreset,
  BuildPreset,
  decrementStat,
  incrementStat,
  MIN_BASE_STAT,
  resetStats,
  StatKey,
} from '../store/slices/statsSlice';
import { RPG_THEME } from '../theme/rpgTheme';

interface StatRowConfig {
  key: StatKey;
  label: string;
  shortCode: string;
  icon: string;
  color: string;
  description: string;
  baseValue: number;
  bonusValue: number;
  totalValue: number;
}

export const StatsControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availablePoints, str, agi, int } = useAppSelector(selectStatsSlice);
  const totalStats = useAppSelector(selectTotalStats);

  const statRows: StatRowConfig[] = [
    {
      key: 'str',
      label: 'Fuerza',
      shortCode: 'STR',
      icon: '⚔️',
      color: RPG_THEME.colors.strColor,
      description: '+3 Poder • +2 Kg Capacidad de Carga',
      baseValue: str,
      bonusValue: totalStats.bonusStr,
      totalValue: totalStats.totalStr,
    },
    {
      key: 'agi',
      label: 'Agilidad',
      shortCode: 'AGI',
      icon: '🏹',
      color: RPG_THEME.colors.agiColor,
      description: '+2 Poder • Evasión y Velocidad Crítica',
      baseValue: agi,
      bonusValue: totalStats.bonusAgi,
      totalValue: totalStats.totalAgi,
    },
    {
      key: 'int',
      label: 'Inteligencia',
      shortCode: 'INT',
      icon: '🔮',
      color: RPG_THEME.colors.intColor,
      description: '+3 Poder • +10 MP Energía Arcana',
      baseValue: int,
      bonusValue: totalStats.bonusInt,
      totalValue: totalStats.totalInt,
    },
  ];

  const presets: { id: BuildPreset; title: string; subtitle: string; icon: string; color: string }[] = [
    {
      id: 'WARRIOR',
      title: 'WARRIOR',
      subtitle: 'Build Guerrero / Tanque',
      icon: '⚔️',
      color: RPG_THEME.colors.strColor,
    },
    {
      id: 'MAGE',
      title: 'MAGE',
      subtitle: 'Build Mago Arcano',
      icon: '🪄',
      color: RPG_THEME.colors.intColor,
    },
    {
      id: 'ROGUE',
      title: 'ROGUE',
      subtitle: 'Build Pícaro Sombrío',
      icon: '🗡️',
      color: RPG_THEME.colors.agiColor,
    },
  ];

  return (
    <View style={styles.container} testID="zone-b-stats">
      {/* Encabezado de Zona + Contador de Puntos Disponibles */}
      <View style={styles.zoneHeader}>
        <View style={styles.zoneTagRow}>
          <View style={styles.zonePill}>
            <Text style={styles.zonePillText}>ZONA B</Text>
          </View>
          <Text style={styles.zoneTitle}>ENTRENAMIENTO DE ATRIBUTOS</Text>
        </View>

        <View
          style={[
            styles.pointsBadge,
            availablePoints === 0 && styles.pointsBadgeZero,
          ]}
        >
          <Text style={styles.pointsBadgeLabel}>PUNTOS DISPONIBLES:</Text>
          <Text
            style={[
              styles.pointsBadgeValue,
              availablePoints === 0 && styles.pointsBadgeValueZero,
            ]}
            testID="stats-available-points"
          >
            {availablePoints} pts
          </Text>
        </View>
      </View>

      {/* Filas de Atributos: STR, AGI, INT */}
      <View style={styles.statsList}>
        {statRows.map((row) => {
          const canDecrement = row.baseValue > MIN_BASE_STAT;
          const canIncrement = availablePoints > 0;
          // Escala visual sobre 30 puntos para barra de atributo
          const baseWidthPct = Math.min(100, Math.round((row.baseValue / 30) * 100));
          const bonusWidthPct = Math.min(
            100 - baseWidthPct,
            Math.round((row.bonusValue / 30) * 100)
          );

          return (
            <View key={row.key} style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={styles.statInfoCol}>
                  <View style={styles.statTitleLine}>
                    <Text style={styles.statIcon}>{row.icon}</Text>
                    <Text style={styles.statName}>
                      {row.label} ({row.shortCode})
                    </Text>
                    <View
                      style={[
                        styles.statValuePill,
                        { borderColor: row.color },
                      ]}
                    >
                      <Text
                        style={[styles.statValuePillText, { color: row.color }]}
                        testID={`stat-base-${row.key}`}
                      >
                        Base: {row.baseValue}
                      </Text>
                      {row.bonusValue > 0 && (
                        <Text style={styles.statBonusText}>
                          {' '}
                          +{row.bonusValue} ítem = {row.totalValue}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.statDescription}>{row.description}</Text>
                </View>

                {/* Botones [-] y [+] */}
                <View style={styles.controlsGroup}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Disminuir ${row.shortCode}`}
                    accessibilityState={{ disabled: !canDecrement }}
                    disabled={!canDecrement}
                    onPress={() => dispatch(decrementStat(row.key))}
                    style={({ pressed }) => [
                      styles.stepButton,
                      !canDecrement && styles.stepButtonDisabled,
                      pressed && canDecrement && styles.stepButtonPressed,
                    ]}
                    testID={`btn-decrement-${row.key}`}
                  >
                    <Text
                      style={[
                        styles.stepButtonText,
                        !canDecrement && styles.stepButtonTextDisabled,
                      ]}
                    >
                      −
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Aumentar ${row.shortCode}`}
                    accessibilityState={{ disabled: !canIncrement }}
                    disabled={!canIncrement}
                    onPress={() => dispatch(incrementStat(row.key))}
                    style={({ pressed }) => [
                      styles.stepButton,
                      styles.stepButtonIncrement,
                      !canIncrement && styles.stepButtonDisabled,
                      pressed && canIncrement && styles.stepButtonPressed,
                    ]}
                    testID={`btn-increment-${row.key}`}
                  >
                    <Text
                      style={[
                        styles.stepButtonText,
                        !canIncrement && styles.stepButtonTextDisabled,
                      ]}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Barra de Nivel del Atributo (Base + Bono Equipado) */}
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarBaseFill,
                    { width: `${baseWidthPct}%`, backgroundColor: row.color },
                  ]}
                />
                {bonusWidthPct > 0 && (
                  <View
                    style={[
                      styles.statBarBonusFill,
                      {
                        width: `${bonusWidthPct}%`,
                        backgroundColor: RPG_THEME.colors.goldPrimary,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Sección de Presets Rápidos (Un solo dispatch reasigna los 15 puntos) */}
      <View style={styles.presetsSection}>
        <Text style={styles.presetsSectionTitle}>
          ⚡ BUILD PRESETS (Reasigna los 15 pts en 1 Dispatch)
        </Text>
        <View style={styles.presetsRow}>
          {presets.map((preset) => (
            <Pressable
              key={preset.id}
              accessibilityRole="button"
              accessibilityLabel={`Preset ${preset.title}`}
              onPress={() => dispatch(applyBuildPreset(preset.id))}
              style={({ pressed }) => [
                styles.presetButton,
                { borderColor: preset.color },
                pressed && styles.presetButtonPressed,
              ]}
              testID={`btn-preset-${preset.id.toLowerCase()}`}
            >
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text style={[styles.presetTitle, { color: preset.color }]}>
                {preset.title}
              </Text>
              <Text style={styles.presetSubtitle}>{preset.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Botón Poción de Reseteo (Reset) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Poción de Reseteo (Reset)"
        onPress={() => dispatch(resetStats())}
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.resetButtonPressed,
        ]}
        testID="btn-reset-stats"
      >
        <Text style={styles.resetButtonText}>
          🧪 Poción de Reseteo (Reset Stats &amp; HP)
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: RPG_THEME.colors.cardGraphite,
    borderRadius: RPG_THEME.radius.lg,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    padding: RPG_THEME.spacing.lg,
    marginBottom: RPG_THEME.spacing.lg,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RPG_THEME.spacing.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zonePill: {
    backgroundColor: RPG_THEME.colors.blueMuted,
    borderColor: RPG_THEME.colors.electricBlue,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RPG_THEME.radius.pill,
  },
  zonePillText: {
    color: RPG_THEME.colors.electricBlueLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  zoneTitle: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RPG_THEME.colors.goldMuted,
    borderColor: RPG_THEME.colors.goldPrimary,
    borderWidth: 1,
    borderRadius: RPG_THEME.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  pointsBadgeZero: {
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderColor: RPG_THEME.colors.borderSlate,
  },
  pointsBadgeLabel: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  pointsBadgeValue: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 13,
    fontWeight: '900',
  },
  pointsBadgeValueZero: {
    color: RPG_THEME.colors.textMuted,
  },
  statsList: {
    gap: 10,
    marginBottom: RPG_THEME.spacing.md,
  },
  statCard: {
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderRadius: RPG_THEME.radius.md,
    padding: RPG_THEME.spacing.md,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    gap: 8,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  statInfoCol: {
    flex: 1,
    gap: 3,
  },
  statTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statIcon: {
    fontSize: 15,
  },
  statName: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  statValuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RPG_THEME.radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: RPG_THEME.colors.bgMidnight,
  },
  statValuePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statBonusText: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  statDescription: {
    color: RPG_THEME.colors.textMuted,
    fontSize: 11,
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 38,
    height: 38,
    borderRadius: RPG_THEME.radius.sm,
    backgroundColor: RPG_THEME.colors.cardElevated,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonIncrement: {
    borderColor: RPG_THEME.colors.goldPrimary,
    backgroundColor: RPG_THEME.colors.goldMuted,
  },
  stepButtonDisabled: {
    opacity: 0.35,
    borderColor: RPG_THEME.colors.borderSlate,
    backgroundColor: RPG_THEME.colors.bgMidnight,
  },
  stepButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  stepButtonText: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  stepButtonTextDisabled: {
    color: RPG_THEME.colors.textMuted,
  },
  statBarTrack: {
    height: 8,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderRadius: RPG_THEME.radius.pill,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
  },
  statBarBaseFill: {
    height: '100%',
  },
  statBarBonusFill: {
    height: '100%',
  },
  presetsSection: {
    marginBottom: RPG_THEME.spacing.md,
    gap: 8,
  },
  presetsSectionTitle: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderWidth: 1.5,
    borderRadius: RPG_THEME.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  presetButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: RPG_THEME.colors.cardElevated,
  },
  presetIcon: {
    fontSize: 18,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  presetSubtitle: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: RPG_THEME.colors.violetMuted,
    borderColor: RPG_THEME.colors.violetPrimary,
    borderWidth: 1,
    borderRadius: RPG_THEME.radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonPressed: {
    opacity: 0.85,
  },
  resetButtonText: {
    color: RPG_THEME.colors.violetLight,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

