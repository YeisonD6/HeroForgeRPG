import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store';
import {
  selectCombatPower,
  selectEquippedItems,
  selectHeroMana,
  selectHeroVisualClass,
  selectIsOverencumbered,
  selectMaxWeightCapacity,
  selectRawCombatPower,
  selectStatsSlice,
  selectTotalStats,
  selectTotalWeight,
} from '../store/selectors';
import { MAX_HERO_HP } from '../store/slices/statsSlice';
import { RPG_THEME } from '../theme/rpgTheme';

export const HeroAvatarHUD: React.FC = () => {
  const { currentHp } = useAppSelector(selectStatsSlice);
  const totalStats = useAppSelector(selectTotalStats);
  const totalWeight = useAppSelector(selectTotalWeight);
  const maxWeightCapacity = useAppSelector(selectMaxWeightCapacity);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);
  const rawPower = useAppSelector(selectRawCombatPower);
  const combatPower = useAppSelector(selectCombatPower);
  const mana = useAppSelector(selectHeroMana);
  const visualClass = useAppSelector(selectHeroVisualClass);
  const equippedItems = useAppSelector(selectEquippedItems);

  const hpPercentage = Math.max(
    0,
    Math.min(100, Math.round((currentHp / MAX_HERO_HP) * 100))
  );

  const weightRatio =
    maxWeightCapacity > 0 ? totalWeight / maxWeightCapacity : 0;
  const weightPercentage = Math.min(100, Math.round(weightRatio * 100));

  // Color dinámico de la barra de peso: Verde -> Amarillo (>=70%) -> Rojo (Sobrecarga)
  let weightBarColor: string = RPG_THEME.colors.emeraldPrimary;
  let weightStateLabel = 'Carga Óptima';
  if (isOverencumbered) {
    weightBarColor = RPG_THEME.colors.crimsonDanger;
    weightStateLabel = '¡SOBRECARGADO!';
  } else if (weightRatio >= 0.7) {
    weightBarColor = RPG_THEME.colors.goldPrimary;
    weightStateLabel = 'Carga Pesada';
  }

  // Color de barra de HP según estado vital
  let hpBarColor: string = RPG_THEME.colors.emeraldPrimary;
  if (visualClass.vitalStatus === 'DEFEATED') {
    hpBarColor = RPG_THEME.colors.crimsonDanger;
  } else if (visualClass.vitalStatus === 'WOUNDED') {
    hpBarColor = RPG_THEME.colors.goldPrimary;
  }

  return (
    <View style={styles.container} testID="zone-a-hud">
      {/* Encabezado de Zona */}
      <View style={styles.zoneHeader}>
        <View style={styles.zoneTagRow}>
          <View style={styles.zonePill}>
            <Text style={styles.zonePillText}>ZONA A</Text>
          </View>
          <Text style={styles.zoneTitle}>AVATAR &amp; HUD REACTIVO</Text>
        </View>
        <View
          style={[
            styles.vitalBadge,
            visualClass.vitalStatus === 'DEFEATED' && styles.vitalBadgeDefeated,
            visualClass.vitalStatus === 'WOUNDED' && styles.vitalBadgeWounded,
          ]}
        >
          <Text style={styles.vitalBadgeText} testID="hud-vital-status">
            {visualClass.expressionEmoji} Estado: {visualClass.vitalLabel}
          </Text>
        </View>
      </View>

      {/* Sección Principal del Héroe: Avatar con Aura + Identidad de Clase + Poder */}
      <View style={styles.heroShowcase}>
        {/* Avatar Circular con Aura Dinámica */}
        <View
          style={[
            styles.avatarOuterAura,
            {
              borderColor: visualClass.auraColor,
              shadowColor: visualClass.auraColor,
              backgroundColor: `${visualClass.auraColor}1A`,
            },
            visualClass.vitalStatus === 'DEFEATED' && styles.avatarDefeated,
          ]}
          testID="hud-avatar-aura"
        >
          <Text style={styles.avatarMainSprite} testID="hud-avatar-sprite">
            {visualClass.vitalStatus === 'DEFEATED'
              ? '💀'
              : visualClass.avatarEmoji}
          </Text>
          {/* Expresión facial superpuesta (esquina superior izquierda) */}
          <View style={styles.expressionBubble}>
            <Text style={styles.expressionText}>
              {visualClass.expressionEmoji}
            </Text>
          </View>
          {/* Ícono de Arma en Mano (esquina inferior derecha) */}
          <View
            style={[
              styles.weaponInHandBubble,
              { borderColor: visualClass.auraColor },
            ]}
            testID="hud-weapon-icon-badge"
          >
            <Text style={styles.weaponInHandIcon}>{visualClass.weaponIcon}</Text>
          </View>
        </View>

        {/* Información de Clase, Arma Equipada y Poder de Combate */}
        <View style={styles.heroIdentityCol}>
          <View
            style={[
              styles.classBadge,
              {
                borderColor: visualClass.auraColor,
                backgroundColor: `${visualClass.auraColor}22`,
              },
            ]}
          >
            <Text
              style={[styles.classBadgeTitle, { color: visualClass.auraColor }]}
              testID="hud-hero-class"
            >
              {visualClass.className}
            </Text>
            <Text style={styles.classArchetypeText} testID="hud-hero-archetype">
              ({visualClass.archetype})
            </Text>
          </View>

          <Text style={styles.weaponEquippedLabel} testID="hud-equipped-weapon">
            En mano: <Text style={styles.weaponNameHighlight}>{visualClass.weaponIcon} {visualClass.weaponName}</Text>
            {equippedItems.length > 1
              ? ` (+${equippedItems.length - 1} equipado${equippedItems.length - 1 > 1 ? 's' : ''})`
              : ''}
          </Text>

          {/* Tarjeta de Poder de Combate Total */}
          <View
            style={[
              styles.powerBox,
              isOverencumbered && styles.powerBoxPenalized,
            ]}
          >
            <View>
              <Text style={styles.powerLabel}>PODER DE COMBATE</Text>
              {isOverencumbered ? (
                <Text style={styles.powerPenaltyNote} testID="hud-power-penalty-note">
                  Penalizado -30% (Bruto: {rawPower})
                </Text>
              ) : (
                <Text style={styles.powerFormulaNote}>
                  STR×3 + AGI×2 + INT×3
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.powerValue,
                isOverencumbered && styles.powerValuePenalized,
              ]}
              testID="hud-combat-power"
            >
              ⚡ {combatPower}
            </Text>
          </View>
        </View>
      </View>

      {/* Resumen de Estadísticas Totales (Base + Bonos de Ítems) */}
      <View style={styles.statsSummaryRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>⚔️ STR TOTAL</Text>
          <Text
            style={[styles.statChipValue, { color: RPG_THEME.colors.strColor }]}
            testID="hud-total-str"
          >
            {totalStats.totalStr}
          </Text>
          <Text style={styles.statChipBreakdown}>
            Base {totalStats.baseStr} + Ítems {totalStats.bonusStr}
          </Text>
        </View>

        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>🏹 AGI TOTAL</Text>
          <Text
            style={[styles.statChipValue, { color: RPG_THEME.colors.agiColor }]}
            testID="hud-total-agi"
          >
            {totalStats.totalAgi}
          </Text>
          <Text style={styles.statChipBreakdown}>
            Base {totalStats.baseAgi} + Ítems {totalStats.bonusAgi}
          </Text>
        </View>

        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>🔮 INT TOTAL</Text>
          <Text
            style={[styles.statChipValue, { color: RPG_THEME.colors.intColor }]}
            testID="hud-total-int"
          >
            {totalStats.totalInt}
          </Text>
          <Text style={styles.statChipBreakdown}>
            Base {totalStats.baseInt} + Ítems {totalStats.bonusInt}
          </Text>
        </View>
      </View>

      {/* Tres Barras Visuales Reactivas: Vida (HP), Energía/Maná y Carga de Peso */}
      <View style={styles.barsSection}>
        {/* 1. Barra de Vida (HP) */}
        <View style={styles.barGroup}>
          <View style={styles.barHeaderRow}>
            <Text style={styles.barLabel}>❤️ Vida (HP)</Text>
            <Text style={styles.barValueText} testID="hud-hp-text">
              {currentHp} / {MAX_HERO_HP} HP ({hpPercentage}%)
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${hpPercentage}%`, backgroundColor: hpBarColor },
              ]}
            />
          </View>
        </View>

        {/* 2. Barra de Energía / Maná Arcano */}
        <View style={styles.barGroup}>
          <View style={styles.barHeaderRow}>
            <Text style={styles.barLabel}>✨ Energía / Maná Arcano</Text>
            <Text style={styles.barValueText} testID="hud-mana-text">
              {mana.currentMana} / {mana.maxMana} MP
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${mana.percentage}%`,
                  backgroundColor: RPG_THEME.colors.violetPrimary,
                },
              ]}
            />
          </View>
        </View>

        {/* 3. Barra de Carga de Peso (Verde -> Amarillo -> Rojo) */}
        <View style={styles.barGroup}>
          <View style={styles.barHeaderRow}>
            <Text style={styles.barLabel}>
              ⚖️ Carga de Peso ({weightStateLabel})
            </Text>
            <Text
              style={[
                styles.barValueText,
                isOverencumbered && styles.overloadTextHighlight,
              ]}
              testID="hud-weight-text"
            >
              {totalWeight} / {maxWeightCapacity} Kg
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${weightPercentage}%`,
                  backgroundColor: weightBarColor,
                },
              ]}
              testID="hud-weight-bar-fill"
            />
          </View>
          <Text style={styles.capacityFormulaHint}>
            Capacidad Máx: 10 + (STR Total {totalStats.totalStr} × 2) ={' '}
            {maxWeightCapacity} Kg
          </Text>
        </View>
      </View>

      {/* Alerta en HUD cuando hay Sobrecarga */}
      {isOverencumbered && (
        <View style={styles.hudOverloadBanner} testID="hud-overload-banner">
          <Text style={styles.hudOverloadBannerTitle}>
            ⚠️ ¡SOBRECARGADO! (-50% Velocidad)
          </Text>
          <Text style={styles.hudOverloadBannerSub}>
            Exceso de +{totalWeight - maxWeightCapacity} Kg • Poder reducido al
            70% ({rawPower} → {combatPower})
          </Text>
        </View>
      )}
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
    backgroundColor: RPG_THEME.colors.violetMuted,
    borderColor: RPG_THEME.colors.violetPrimary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RPG_THEME.radius.pill,
  },
  zonePillText: {
    color: RPG_THEME.colors.violetLight,
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
  vitalBadge: {
    backgroundColor: RPG_THEME.colors.emeraldMuted,
    borderColor: RPG_THEME.colors.emeraldPrimary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RPG_THEME.radius.pill,
  },
  vitalBadgeWounded: {
    backgroundColor: RPG_THEME.colors.goldMuted,
    borderColor: RPG_THEME.colors.goldPrimary,
  },
  vitalBadgeDefeated: {
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderColor: RPG_THEME.colors.crimsonDanger,
  },
  vitalBadgeText: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  heroShowcase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderRadius: RPG_THEME.radius.md,
    padding: RPG_THEME.spacing.md,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    marginBottom: RPG_THEME.spacing.md,
    gap: 14,
  },
  avatarOuterAura: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarDefeated: {
    opacity: 0.75,
  },
  avatarMainSprite: {
    fontSize: 40,
  },
  expressionBubble: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expressionText: {
    fontSize: 14,
  },
  weaponInHandBubble: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weaponInHandIcon: {
    fontSize: 16,
  },
  heroIdentityCol: {
    flex: 1,
    gap: 6,
  },
  classBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: RPG_THEME.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  classBadgeTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  classArchetypeText: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  weaponEquippedLabel: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 12,
  },
  weaponNameHighlight: {
    color: RPG_THEME.colors.goldLight,
    fontWeight: '700',
  },
  powerBox: {
    marginTop: 2,
    backgroundColor: RPG_THEME.colors.cardElevated,
    borderRadius: RPG_THEME.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.goldPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  powerBoxPenalized: {
    borderColor: RPG_THEME.colors.crimsonDanger,
    backgroundColor: RPG_THEME.colors.crimsonMuted,
  },
  powerLabel: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  powerFormulaNote: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 10,
  },
  powerPenaltyNote: {
    color: RPG_THEME.colors.crimsonLight,
    fontSize: 10,
    fontWeight: '700',
  },
  powerValue: {
    color: RPG_THEME.colors.goldPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  powerValuePenalized: {
    color: RPG_THEME.colors.crimsonLight,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: RPG_THEME.spacing.md,
  },
  statChip: {
    flex: 1,
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderRadius: RPG_THEME.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    alignItems: 'center',
  },
  statChipLabel: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  statChipValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statChipBreakdown: {
    color: RPG_THEME.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  barsSection: {
    gap: 10,
  },
  barGroup: {
    gap: 4,
  },
  barHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  barValueText: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  overloadTextHighlight: {
    color: RPG_THEME.colors.crimsonLight,
    fontWeight: '900',
  },
  barTrack: {
    height: 10,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderRadius: RPG_THEME.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
  },
  barFill: {
    height: '100%',
    borderRadius: RPG_THEME.radius.pill,
  },
  capacityFormulaHint: {
    color: RPG_THEME.colors.textMuted,
    fontSize: 10,
  },
  hudOverloadBanner: {
    marginTop: RPG_THEME.spacing.md,
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderColor: RPG_THEME.colors.crimsonDanger,
    borderWidth: 1.5,
    borderRadius: RPG_THEME.radius.md,
    padding: RPG_THEME.spacing.sm,
    alignItems: 'center',
  },
  hudOverloadBannerTitle: {
    color: RPG_THEME.colors.crimsonLight,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  hudOverloadBannerSub: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 11,
    marginTop: 2,
  },
});

