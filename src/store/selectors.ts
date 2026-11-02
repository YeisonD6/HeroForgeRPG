import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { InventoryItem } from './slices/inventorySlice';
import { MAX_HERO_HP } from './slices/statsSlice';

export interface TotalStatsResult {
  baseStr: number;
  baseAgi: number;
  baseInt: number;
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  totalStr: number;
  totalAgi: number;
  totalInt: number;
}

export type HeroVitalStatus = 'HEALTHY' | 'WOUNDED' | 'DEFEATED';

export interface HeroVisualClassResult {
  className: string;
  archetype: string;
  auraColor: string;
  avatarEmoji: string;
  expressionEmoji: string;
  vitalStatus: HeroVitalStatus;
  vitalLabel: string;
  weaponIcon: string;
  weaponName: string;
  dominantStat: 'str' | 'int' | 'agi' | 'none';
}

export const selectStatsSlice = (state: RootState) => state.stats;
export const selectInventorySlice = (state: RootState) => state.inventory;
export const selectActionLogSlice = (state: RootState) => state.actionLog;

export const selectEquippedItems = createSelector(
  [selectInventorySlice],
  (inventory): InventoryItem[] =>
    inventory.catalog.filter((item) => inventory.equippedIds.includes(item.id))
);

/**
 * 1. selectTotalStats
 * Calcula las estadísticas totales combinando atributos base (statsSlice)
 * y bonificaciones del equipamiento activo (inventorySlice).
 */
export const selectTotalStats = createSelector(
  [selectStatsSlice, selectEquippedItems],
  (stats, equippedItems): TotalStatsResult => {
    const bonusStr = equippedItems.reduce((acc, item) => acc + item.bonusStr, 0);
    const bonusAgi = equippedItems.reduce((acc, item) => acc + item.bonusAgi, 0);
    const bonusInt = equippedItems.reduce((acc, item) => acc + item.bonusInt, 0);

    return {
      baseStr: stats.str,
      baseAgi: stats.agi,
      baseInt: stats.int,
      bonusStr,
      bonusAgi,
      bonusInt,
      totalStr: stats.str + bonusStr,
      totalAgi: stats.agi + bonusAgi,
      totalInt: stats.int + bonusInt,
    };
  }
);

/**
 * Capacidad máxima de cargar
 * 10 + (totalStr * 2)
 */
export const selectMaxWeightCapacity = createSelector(
  [selectTotalStats],
  ({ totalStr }): number => 10 + totalStr * 2
);

/**
 * 2. selectTotalWeight
 * Suma el peso en Kg de todos los ítems equipados.
 */
export const selectTotalWeight = createSelector(
  [selectEquippedItems],
  (equippedItems): number =>
    equippedItems.reduce((acc, item) => acc + item.weight, 0)
);

/**
 * 3. selectIsOverencumbered
 * Determina si el peso equipado supera la capacidad máxima (10 + totalStr * 2).
 */
export const selectIsOverencumbered = createSelector(
  [selectTotalWeight, selectMaxWeightCapacity],
  (totalWeight, maxWeightCapacity): boolean => totalWeight > maxWeightCapacity
);

/**
 * Poder de combate bruto sin penalización:
 * totalStr * 3 + totalAgi * 2 + totalInt * 3
 */
export const selectRawCombatPower = createSelector(
  [selectTotalStats],
  ({ totalStr, totalAgi, totalInt }): number =>
    totalStr * 3 + totalAgi * 2 + totalInt * 3
);

/**
 * 4. selectCombatPower
 * Poder de combate efectivo. Si existe sobrecarga, aplica penalización del 30%:
 * Math.round(rawPower * 0.7)
 */
export const selectCombatPower = createSelector(
  [selectRawCombatPower, selectIsOverencumbered],
  (rawPower, isOverencumbered): number =>
    isOverencumbered ? Math.round(rawPower * 0.7) : rawPower
);

/**
 * Maná / Energía arcana derivada de la Inteligencia Total
 */
export const selectHeroMana = createSelector(
  [selectTotalStats],
  ({ totalInt }) => {
    const maxMana = 50 + totalInt * 10;
    const currentMana = totalInt * 10;
    return {
      currentMana,
      maxMana,
      percentage: Math.min(100, Math.round((currentMana / maxMana) * 100)),
    };
  }
);

/**
 * 5. selectHeroVisualClass
 * Retorna la clase visual, arquetipo, color de aura, sprite/emoji,
 * arma en mano y estado vital (sano, herido, derrotado) del avatar.
 */
export const selectHeroVisualClass = createSelector(
  [selectTotalStats, selectStatsSlice, selectEquippedItems],
  (totalStats, stats, equippedItems): HeroVisualClassResult => {
    const { totalStr, totalAgi, totalInt } = totalStats;
    const { currentHp } = stats;

    // Estado vital según HP actual
    let vitalStatus: HeroVitalStatus = 'HEALTHY';
    let vitalLabel = 'Sano';
    let expressionEmoji = '😤';

    if (currentHp <= 0) {
      vitalStatus = 'DEFEATED';
      vitalLabel = 'Derrotado';
      expressionEmoji = '💀';
    } else if (currentHp <= MAX_HERO_HP * 0.45) {
      vitalStatus = 'WOUNDED';
      vitalLabel = 'Herido';
      expressionEmoji = '😣';
    }

    // Arma / objeto principal en mano
    const primaryItem = equippedItems[0];
    const weaponIcon = primaryItem ? primaryItem.icon : '✊';
    const weaponName = primaryItem ? primaryItem.name : 'Manos Desnudas';

    // Determinación de clase según estadística dominante y equipamiento
    const maxStat = Math.max(totalStr, totalInt, totalAgi);
    const hasShield = equippedItems.some((i) => i.id === 'titanium-shield');
    const hasSword = equippedItems.some((i) => i.id === 'fire-sword');

    let className = 'Novato';
    let archetype = 'Aldeano';
    let auraColor = '#94a3b8';
    let avatarEmoji = '🧑‍🌾';
    let dominantStat: 'str' | 'int' | 'agi' | 'none' = 'none';

    if (maxStat >= 15) {
      if (totalStr === maxStat) {
        className = 'Berserker Implacable';
        archetype = hasShield && !hasSword ? 'Tanque Pesado' : 'Guerrero Berserker';
        auraColor = '#ef4444';
        avatarEmoji = hasShield && !hasSword ? '🛡️' : '⚔️';
        dominantStat = 'str';
      } else if (totalInt === maxStat) {
        className = 'Archimago Arcano';
        archetype = 'Archimago';
        auraColor = '#3b82f6';
        avatarEmoji = '🧙‍♂️';
        dominantStat = 'int';
      } else {
        className = 'Asesino Sombrío';
        archetype = 'Pícaro Sombrío';
        auraColor = '#10b981';
        avatarEmoji = '🥷';
        dominantStat = 'agi';
      }
    } else if (hasShield) {
      className = 'Tanque Pesado';
      archetype = 'Guardián de Titanio';
      auraColor = '#f59e0b';
      avatarEmoji = '🛡️';
      dominantStat = 'str';
    }

    return {
      className,
      archetype,
      auraColor,
      avatarEmoji,
      expressionEmoji,
      vitalStatus,
      vitalLabel,
      weaponIcon,
      weaponName,
      dominantStat,
    };
  }
);

/**
 * Selector consolidado compatible con el código base de referencia (Sección 4 del PDF)
 */
export const selectHeroComputedStatus = createSelector(
  [
    selectTotalStats,
    selectTotalWeight,
    selectMaxWeightCapacity,
    selectIsOverencumbered,
    selectRawCombatPower,
    selectCombatPower,
    selectHeroVisualClass,
    selectStatsSlice,
  ],
  (
    totalStats,
    currentWeight,
    maxWeightCapacity,
    isOverloaded,
    rawPower,
    combatPower,
    visualClass,
    stats
  ) => ({
    totalStr: totalStats.totalStr,
    totalAgi: totalStats.totalAgi,
    totalInt: totalStats.totalInt,
    currentWeight,
    maxWeightCapacity,
    isOverloaded,
    rawPower,
    combatPower,
    heroClass: visualClass.className,
    archetype: visualClass.archetype,
    auraColor: visualClass.auraColor,
    isDefeated: stats.currentHp <= 0,
  })
);

