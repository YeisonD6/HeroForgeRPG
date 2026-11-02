import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectActionLogSlice,
  selectCombatPower,
  selectIsOverencumbered,
  selectStatsSlice,
  selectTotalStats,
} from '../store/selectors';
import { clearActionLog } from '../store/slices/actionLogSlice';
import { healHero, MAX_HERO_HP, takeDamage } from '../store/slices/statsSlice';
import { RPG_THEME } from '../theme/rpgTheme';

export const MAX_BOSS_HP = 250;

export const ReduxLiveInspector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentHp } = useAppSelector(selectStatsSlice);
  const { totalAgi } = useAppSelector(selectTotalStats);
  const combatPower = useAppSelector(selectCombatPower);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);
  const { entries, totalDispatchedCount } = useAppSelector(selectActionLogSlice);

  // Estado local del Boss en la arena (usa useState legítimamente porque solo concierne a la arena local)
  const [bossHp, setBossHp] = useState<number>(MAX_BOSS_HP);
  const [combatSummary, setCombatSummary] = useState<string>(
    '¡El Señor del Abismo aguarda tu ataque! Tu daño depende de selectCombatPower.'
  );

  const isHeroDefeated = currentHp <= 0;
  const isBossDefeated = bossHp <= 0;
  const bossHpPct = Math.max(
    0,
    Math.min(100, Math.round((bossHp / MAX_BOSS_HP) * 100))
  );

  const handleAttackBoss = () => {
    if (isHeroDefeated || isBossDefeated) {
      return;
    }

    const damageToBoss = combatPower;
    const nextBossHp = Math.max(0, bossHp - damageToBoss);
    setBossHp(nextBossHp);

    if (nextBossHp <= 0) {
      setCombatSummary(
        `🏆 ¡VICTORIA ÉPICA! Infligiste ${damageToBoss} de daño con tu Poder de Combate y derrotaste al Boss.`
      );
      return;
    }

    // Contraataque del Boss (mitigado por AGI, incrementado si hay sobrecarga por -50% Velocidad)
    const agilityMitigation = Math.min(18, Math.floor(totalAgi * 0.8));
    const overloadPenaltyDamage = isOverencumbered ? 10 : 0;
    const bossCounterDamage = Math.max(
      10,
      32 - agilityMitigation + overloadPenaltyDamage
    );

    dispatch(takeDamage(bossCounterDamage));

    const nextHeroHp = Math.max(0, currentHp - bossCounterDamage);
    if (nextHeroHp <= 0) {
      setCombatSummary(
        `💀 Golpeaste por ${damageToBoss} DMG, pero el Boss contraatacó por ${bossCounterDamage} HP. ¡Tu héroe ha caído!`
      );
    } else {
      setCombatSummary(
        `⚔️ Atacaste al Boss por ${damageToBoss} DMG. El Boss contraatacó causando -${bossCounterDamage} HP${
          isOverencumbered ? ' (+10 DMG por lentitud de Sobrecarga)' : ''
        }.`
      );
    }
  };

  const handleDirectBossStrike = () => {
    if (isHeroDefeated) {
      return;
    }
    const strikeDamage = 30;
    dispatch(takeDamage(strikeDamage));
    const nextHeroHp = Math.max(0, currentHp - strikeDamage);
    setCombatSummary(
      nextHeroHp <= 0
        ? `💀 El Boss desató Llamarada Abisal (-${strikeDamage} HP). ¡Héroe derrotado!`
        : `🔥 Recibiste golpe directo del Boss (-${strikeDamage} HP). Observa el cambio en el Avatar.`
    );
  };

  const handleHealHero = () => {
    dispatch(healHero());
    setCombatSummary(
      '✨ Luz Restauradora activada: HP del héroe restaurado al 100% (100 HP).'
    );
  };

  const handleResetCombat = () => {
    setBossHp(MAX_BOSS_HP);
    dispatch(healHero());
    setCombatSummary(
      '🔄 Arena reiniciada: Boss al 100% (250 HP) y Héroe restaurado.'
    );
  };

  return (
    <View style={styles.container} testID="zone-d-inspector">
      {/* Encabezado de Zona D */}
      <View style={styles.zoneHeader}>
        <View style={styles.zoneTagRow}>
          <View style={styles.zonePill}>
            <Text style={styles.zonePillText}>ZONA D</Text>
          </View>
          <Text style={styles.zoneTitle}>
            ARENA DE COMBATE &amp; INSPECTOR REDUX
          </Text>
        </View>
      </View>

      {/* SUBSECCIÓN 1: Simulador de Combate contra Boss */}
      <View style={styles.arenaCard}>
        <View style={styles.bossHeaderRow}>
          <View style={styles.bossIdentityRow}>
            <View style={styles.bossAvatarBox}>
              <Text style={styles.bossEmoji}>
                {isBossDefeated ? '💥' : '👹'}
              </Text>
            </View>
            <View>
              <Text style={styles.bossName}>Ignis, Señor del Abismo</Text>
              <Text style={styles.bossSubtitle} testID="combat-state-badge">
                {isBossDefeated
                  ? '🏆 ESTADO: VICTORIA DEL HÉROE'
                  : isHeroDefeated
                    ? '💀 ESTADO: HÉROE DERROTADO'
                    : `⚡ Tu Daño por Golpe: ${combatPower} DMG`}
              </Text>
            </View>
          </View>

          <View style={styles.bossHpNumbersBox}>
            <Text style={styles.bossHpLabel}>BOSS HP</Text>
            <Text style={styles.bossHpValue} testID="boss-hp-text">
              {bossHp} / {MAX_BOSS_HP}
            </Text>
          </View>
        </View>

        {/* Barra de Vida del Boss */}
        <View style={styles.bossBarTrack}>
          <View
            style={[
              styles.bossBarFill,
              {
                width: `${bossHpPct}%`,
                backgroundColor: isBossDefeated
                  ? RPG_THEME.colors.emeraldPrimary
                  : RPG_THEME.colors.crimsonDanger,
              },
            ]}
          />
        </View>

        {/* Mensaje de estado del combate */}
        <View
          style={[
            styles.combatBanner,
            isBossDefeated && styles.combatBannerVictory,
            isHeroDefeated && styles.combatBannerDefeat,
          ]}
        >
          <Text style={styles.combatBannerText} testID="combat-summary-text">
            {combatSummary}
          </Text>
        </View>

        {/* Botones de Acción de Combate */}
        <View style={styles.combatButtonsGrid}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atacar al Jefe"
            accessibilityState={{ disabled: isHeroDefeated || isBossDefeated }}
            disabled={isHeroDefeated || isBossDefeated}
            onPress={handleAttackBoss}
            style={({ pressed }) => [
              styles.combatBtn,
              styles.combatBtnAttack,
              (isHeroDefeated || isBossDefeated) && styles.combatBtnDisabled,
              pressed &&
                !isHeroDefeated &&
                !isBossDefeated &&
                styles.combatBtnPressed,
            ]}
            testID="btn-attack-boss"
          >
            <Text style={styles.combatBtnAttackText}>
              ⚔️ Atacar Boss ({combatPower} DMG)
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Recibir daño de prueba"
            accessibilityState={{ disabled: isHeroDefeated }}
            disabled={isHeroDefeated}
            onPress={handleDirectBossStrike}
            style={({ pressed }) => [
              styles.combatBtn,
              styles.combatBtnDamage,
              isHeroDefeated && styles.combatBtnDisabled,
              pressed && !isHeroDefeated && styles.combatBtnPressed,
            ]}
            testID="btn-take-damage"
          >
            <Text style={styles.combatBtnSecondaryText}>
              🔥 Recibir Daño (-30 HP)
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Curar Héroe"
            accessibilityState={{ disabled: currentHp >= MAX_HERO_HP }}
            disabled={currentHp >= MAX_HERO_HP}
            onPress={handleHealHero}
            style={({ pressed }) => [
              styles.combatBtn,
              styles.combatBtnHeal,
              currentHp >= MAX_HERO_HP && styles.combatBtnDisabled,
              pressed && currentHp < MAX_HERO_HP && styles.combatBtnPressed,
            ]}
            testID="btn-heal-hero"
          >
            <Text style={styles.combatBtnHealText}>✨ Curar Héroe (100%)</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reiniciar Combate"
            onPress={handleResetCombat}
            style={({ pressed }) => [
              styles.combatBtn,
              styles.combatBtnReset,
              pressed && styles.combatBtnPressed,
            ]}
            testID="btn-reset-combat"
          >
            <Text style={styles.combatBtnSecondaryText}>
              🔄 Reiniciar Arena
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SUBSECCIÓN 2: Consola Visual de Redux en Vivo (Últimas 5 acciones) */}
      <View style={styles.consoleCard}>
        <View style={styles.consoleHeaderRow}>
          <View style={styles.consoleTitleRow}>
            <View style={styles.liveDot} />
            <Text style={styles.consoleTitle}>
              CONSOLA REDUX EN VIVO (Últimas 5 Acciones)
            </Text>
          </View>

          <View style={styles.consoleHeaderRight}>
            <Text style={styles.totalActionsBadge} testID="log-total-count">
              Total Dispatches: {totalDispatchedCount}
            </Text>
            {entries.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpiar consola Redux"
                onPress={() => dispatch(clearActionLog())}
                style={styles.clearLogBtn}
                testID="btn-clear-log"
              >
                <Text style={styles.clearLogBtnText}>Limpiar</Text>
              </Pressable>
            )}
          </View>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyConsoleBox} testID="log-empty-state">
            <Text style={styles.emptyConsoleText}>
              Esperando dispatch... Entrena un atributo, equipa un objeto o
              combate para ver el flujo Redux en tiempo real.
            </Text>
          </View>
        ) : (
          <View style={styles.logEntriesList} testID="log-entries-list">
            {entries.map((entry, index) => (
              <View
                key={entry.id}
                style={[
                  styles.logRow,
                  index === 0 && styles.logRowLatest,
                ]}
                testID={`log-entry-${index}`}
              >
                <View style={styles.logOrderBadge}>
                  <Text style={styles.logOrderText}>
                    #{totalDispatchedCount - index}
                  </Text>
                </View>

                <View style={styles.logMainCol}>
                  <Text style={styles.logTickerText}>
                    <Text style={styles.logActionType}>[{entry.type}]</Text>
                    <Text style={styles.logArrow}> -&gt; </Text>
                    <Text style={styles.logPayloadText}>
                      {entry.formattedPayload}
                    </Text>
                  </Text>
                </View>

                <Text style={styles.logTimeText}>{entry.timestamp}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
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
    marginBottom: RPG_THEME.spacing.xl,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RPG_THEME.spacing.md,
  },
  zoneTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zonePill: {
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderColor: RPG_THEME.colors.crimsonDanger,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RPG_THEME.radius.pill,
  },
  zonePillText: {
    color: RPG_THEME.colors.crimsonLight,
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
  arenaCard: {
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderRadius: RPG_THEME.radius.md,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    padding: RPG_THEME.spacing.md,
    marginBottom: RPG_THEME.spacing.md,
    gap: 10,
  },
  bossHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  bossIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bossAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: RPG_THEME.radius.md,
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderWidth: 1.5,
    borderColor: RPG_THEME.colors.crimsonDanger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossEmoji: {
    fontSize: 26,
  },
  bossName: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  bossSubtitle: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  bossHpNumbersBox: {
    alignItems: 'flex-end',
  },
  bossHpLabel: {
    color: RPG_THEME.colors.crimsonLight,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  bossHpValue: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  bossBarTrack: {
    height: 12,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderRadius: RPG_THEME.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
  },
  bossBarFill: {
    height: '100%',
    borderRadius: RPG_THEME.radius.pill,
  },
  combatBanner: {
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderRadius: RPG_THEME.radius.sm,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  combatBannerVictory: {
    borderColor: RPG_THEME.colors.emeraldPrimary,
    backgroundColor: RPG_THEME.colors.emeraldMuted,
  },
  combatBannerDefeat: {
    borderColor: RPG_THEME.colors.crimsonDanger,
    backgroundColor: RPG_THEME.colors.crimsonMuted,
  },
  combatBannerText: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 11,
    lineHeight: 16,
  },
  combatButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  combatBtn: {
    width: '48.5%',
    borderRadius: RPG_THEME.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  combatBtnAttack: {
    backgroundColor: RPG_THEME.colors.goldMuted,
    borderColor: RPG_THEME.colors.goldPrimary,
  },
  combatBtnDamage: {
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderColor: RPG_THEME.colors.crimsonDanger,
  },
  combatBtnHeal: {
    backgroundColor: RPG_THEME.colors.emeraldMuted,
    borderColor: RPG_THEME.colors.emeraldPrimary,
  },
  combatBtnReset: {
    backgroundColor: RPG_THEME.colors.cardElevated,
    borderColor: RPG_THEME.colors.borderBright,
  },
  combatBtnDisabled: {
    opacity: 0.4,
  },
  combatBtnPressed: {
    transform: [{ scale: 0.97 }],
  },
  combatBtnAttackText: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 12,
    fontWeight: '900',
  },
  combatBtnHealText: {
    color: RPG_THEME.colors.emeraldLight,
    fontSize: 12,
    fontWeight: '900',
  },
  combatBtnSecondaryText: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  consoleCard: {
    backgroundColor: '#050811',
    borderRadius: RPG_THEME.radius.md,
    borderWidth: 1.5,
    borderColor: RPG_THEME.colors.electricBlue,
    padding: RPG_THEME.spacing.md,
    gap: 8,
  },
  consoleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  consoleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RPG_THEME.colors.emeraldPrimary,
  },
  consoleTitle: {
    color: RPG_THEME.colors.electricBlueLight,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  consoleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalActionsBadge: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  clearLogBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    backgroundColor: RPG_THEME.colors.cardSurface,
  },
  clearLogBtnText: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyConsoleBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyConsoleText: {
    color: RPG_THEME.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logEntriesList: {
    gap: 6,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderRadius: RPG_THEME.radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    gap: 8,
  },
  logRowLatest: {
    borderColor: RPG_THEME.colors.goldPrimary,
    backgroundColor: RPG_THEME.colors.cardElevated,
  },
  logOrderBadge: {
    backgroundColor: RPG_THEME.colors.bgMidnight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderBright,
  },
  logOrderText: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 10,
    fontWeight: '900',
  },
  logMainCol: {
    flex: 1,
  },
  logTickerText: {
    fontSize: 11,
  },
  logActionType: {
    color: RPG_THEME.colors.electricBlueLight,
    fontWeight: '800',
  },
  logArrow: {
    color: RPG_THEME.colors.textMuted,
    fontWeight: '700',
  },
  logPayloadText: {
    color: RPG_THEME.colors.emeraldLight,
    fontWeight: '800',
  },
  logTimeText: {
    color: RPG_THEME.colors.textMuted,
    fontSize: 10,
  },
});

