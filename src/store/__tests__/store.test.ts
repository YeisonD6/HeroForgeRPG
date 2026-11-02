import { createAppStore } from '../index';
import {
  selectCombatPower,
  selectHeroComputedStatus,
  selectHeroVisualClass,
  selectIsOverencumbered,
  selectMaxWeightCapacity,
  selectRawCombatPower,
  selectTotalStats,
  selectTotalWeight,
} from '../selectors';
import { clearActionLog } from '../slices/actionLogSlice';
import { clearEquipment, toggleEquipItem } from '../slices/inventorySlice';
import {
  applyBuildPreset,
  decrementStat,
  healHero,
  incrementStat,
  resetStats,
  takeDamage,
} from '../slices/statsSlice';

describe('HeroForge RPG — Redux Store, Slices & Derived Selectors', () => {
  describe('statsSlice', () => {
    it('inicia con availablePoints: 15, str: 5, agi: 5, int: 5, currentHp: 100', () => {
      const store = createAppStore();
      expect(store.getState().stats).toEqual({
        availablePoints: 15,
        str: 5,
        agi: 5,
        int: 5,
        currentHp: 100,
      });
    });

    it('incrementa atributos y consume puntos disponibles', () => {
      const store = createAppStore();
      store.dispatch(incrementStat('str'));
      store.dispatch(incrementStat('agi'));
      store.dispatch(incrementStat('int'));

      expect(store.getState().stats).toEqual({
        availablePoints: 12,
        str: 6,
        agi: 6,
        int: 6,
        currentHp: 100,
      });
    });

    it('decrementa atributos y recupera puntos disponibles', () => {
      const store = createAppStore();
      store.dispatch(decrementStat('str'));
      expect(store.getState().stats.str).toBe(4);
      expect(store.getState().stats.availablePoints).toBe(16);
    });

    it('bloquea operaciones inválidas: ningún atributo base baja de 1 y no incrementa sin puntos', () => {
      const store = createAppStore();
      // Intentar bajar str por debajo de 1
      for (let i = 0; i < 10; i++) {
        store.dispatch(decrementStat('str'));
      }
      expect(store.getState().stats.str).toBe(1);
      expect(store.getState().stats.availablePoints).toBe(19);

      // Consumir todos los puntos disponibles
      for (let i = 0; i < 25; i++) {
        store.dispatch(incrementStat('int'));
      }
      expect(store.getState().stats.availablePoints).toBe(0);
      expect(store.getState().stats.int).toBe(24);
    });

    it('aplica presets WARRIOR, MAGE y ROGUE redistribuyendo los 15 puntos en una sola acción', () => {
      const store = createAppStore();

      store.dispatch(applyBuildPreset('WARRIOR'));
      expect(store.getState().stats).toMatchObject({
        str: 16,
        agi: 8,
        int: 6,
        availablePoints: 0,
      });
      expect(
        store.getState().stats.str +
          store.getState().stats.agi +
          store.getState().stats.int
      ).toBe(30);

      store.dispatch(applyBuildPreset('MAGE'));
      expect(store.getState().stats).toMatchObject({
        str: 5,
        agi: 7,
        int: 18,
        availablePoints: 0,
      });

      store.dispatch(applyBuildPreset('ROGUE'));
      expect(store.getState().stats).toMatchObject({
        str: 7,
        agi: 17,
        int: 6,
        availablePoints: 0,
      });
    });

    it('aplica daño (takeDamage), cura al héroe (healHero) y reinicia estadísticas (resetStats)', () => {
      const store = createAppStore();

      store.dispatch(takeDamage(65));
      expect(store.getState().stats.currentHp).toBe(35);

      // No baja de 0 HP
      store.dispatch(takeDamage(999));
      expect(store.getState().stats.currentHp).toBe(0);

      // Curación parcial y total
      store.dispatch(healHero(40));
      expect(store.getState().stats.currentHp).toBe(40);

      store.dispatch(healHero());
      expect(store.getState().stats.currentHp).toBe(100);

      // Modificar stats y daño, luego resetStats
      store.dispatch(applyBuildPreset('WARRIOR'));
      store.dispatch(takeDamage(50));
      store.dispatch(resetStats());

      expect(store.getState().stats).toEqual({
        availablePoints: 15,
        str: 5,
        agi: 5,
        int: 5,
        currentHp: 100,
      });
    });
  });

  describe('inventorySlice', () => {
    it('contiene un catálogo inicial de 6 objetos RPG completos', () => {
      const store = createAppStore();
      const { catalog, equippedIds } = store.getState().inventory;
      expect(catalog).toHaveLength(6);
      expect(equippedIds).toEqual([]);
      expect(catalog.map((i) => i.name)).toEqual([
        'Espada de Fuego',
        'Escudo de Titanio',
        'Báculo Arcano',
        'Botas Élficas',
        'Armadura Maldita',
        'Amuleto del Dragón',
      ]);
    });

    it('equipa, desequipa (toggleEquipItem) y limpia todo el equipamiento (clearEquipment)', () => {
      const store = createAppStore();

      store.dispatch(toggleEquipItem('fire-sword'));
      expect(store.getState().inventory.equippedIds).toEqual(['fire-sword']);

      store.dispatch(toggleEquipItem('arcane-staff'));
      expect(store.getState().inventory.equippedIds).toEqual([
        'fire-sword',
        'arcane-staff',
      ]);

      // Toggle del mismo ítem lo desequipa
      store.dispatch(toggleEquipItem('fire-sword'));
      expect(store.getState().inventory.equippedIds).toEqual(['arcane-staff']);

      // Limpiar todo el equipamiento
      store.dispatch(clearEquipment());
      expect(store.getState().inventory.equippedIds).toEqual([]);
    });
  });

  describe('Selectores Derivados y Lógica Matemática (selectors.ts)', () => {
    it('calcula correctamente selectTotalStats, selectMaxWeightCapacity y selectCombatPower base', () => {
      const store = createAppStore();
      const state = store.getState();

      // Estado base: str=5, agi=5, int=5
      expect(selectTotalStats(state)).toEqual({
        baseStr: 5,
        baseAgi: 5,
        baseInt: 5,
        bonusStr: 0,
        bonusAgi: 0,
        bonusInt: 0,
        totalStr: 5,
        totalAgi: 5,
        totalInt: 5,
      });

      // Capacidad máxima = 10 + (5 * 2) = 20 Kg
      expect(selectMaxWeightCapacity(state)).toBe(20);
      expect(selectTotalWeight(state)).toBe(0);
      expect(selectIsOverencumbered(state)).toBe(false);

      // Poder bruto = 5*3 + 5*2 + 5*3 = 15 + 10 + 15 = 40
      expect(selectCombatPower(state)).toBe(40);
    });

    it('calcula bonificaciones al equipar la Espada de Fuego y cambia la clase visual', () => {
      const store = createAppStore();
      // Espada de Fuego: +10 STR, +2 AGI, +0 INT, peso 10 Kg
      store.dispatch(toggleEquipItem('fire-sword'));

      const state = store.getState();
      const totalStats = selectTotalStats(state);
      expect(totalStats.totalStr).toBe(15);
      expect(totalStats.totalAgi).toBe(7);
      expect(totalStats.totalInt).toBe(5);

      // Capacidad máxima = 10 + (15 * 2) = 40 Kg
      expect(selectMaxWeightCapacity(state)).toBe(40);
      expect(selectTotalWeight(state)).toBe(10);
      expect(selectIsOverencumbered(state)).toBe(false);

      // Poder bruto = 15*3 + 7*2 + 5*3 = 45 + 14 + 15 = 74
      expect(selectCombatPower(state)).toBe(74);

      // Clase visual cambia a Berserker Implacable / Guerrero Berserker
      const visual = selectHeroVisualClass(state);
      expect(visual.className).toBe('Berserker Implacable');
      expect(visual.archetype).toBe('Guerrero Berserker');
      expect(visual.auraColor).toBe('#ef4444');
      expect(visual.weaponName).toBe('Espada de Fuego');
    });

    it('detecta sobrecarga (selectIsOverencumbered) y aplica penalización del 30% al poder (Math.round(rawPower * 0.7))', () => {
      const store = createAppStore();
      // Equipar Armadura Maldita (+2 STR, +6 INT, 24 Kg) y Escudo de Titanio (+2 STR, +2 INT, 18 Kg)
      store.dispatch(toggleEquipItem('cursed-armor'));
      store.dispatch(toggleEquipItem('titanium-shield'));

      const state = store.getState();
      // totalStr = 5 + 2 + 2 = 9 -> maxWeightCapacity = 10 + 9*2 = 28 Kg
      // totalWeight = 24 + 18 = 42 Kg (> 28 Kg -> SOBRECARGADO)
      expect(selectMaxWeightCapacity(state)).toBe(28);
      expect(selectTotalWeight(state)).toBe(42);
      expect(selectIsOverencumbered(state)).toBe(true);

      // totalStr=9, totalAgi=5, totalInt=13
      // rawPower = 9*3 + 5*2 + 13*3 = 27 + 10 + 39 = 76
      // penalized combatPower = Math.round(76 * 0.7) = Math.round(53.2) = 53
      expect(selectRawCombatPower(state)).toBe(76);
      expect(selectCombatPower(state)).toBe(53);
      expect(selectHeroComputedStatus(state).isOverloaded).toBe(true);
    });

    it('cambia clase visual a Archimago Arcano y Asesino Sombrío según atributo dominante', () => {
      const store = createAppStore();

      store.dispatch(applyBuildPreset('MAGE'));
      expect(selectHeroVisualClass(store.getState()).className).toBe(
        'Archimago Arcano'
      );
      expect(selectHeroVisualClass(store.getState()).auraColor).toBe('#3b82f6');

      store.dispatch(applyBuildPreset('ROGUE'));
      expect(selectHeroVisualClass(store.getState()).className).toBe(
        'Asesino Sombrío'
      );
      expect(selectHeroVisualClass(store.getState()).auraColor).toBe('#10b981');
    });

    it('actualiza apariencia vital del avatar entre Sano, Herido y Derrotado', () => {
      const store = createAppStore();
      expect(selectHeroVisualClass(store.getState()).vitalStatus).toBe(
        'HEALTHY'
      );

      store.dispatch(takeDamage(60)); // Queda en 40 HP (<= 45%)
      expect(selectHeroVisualClass(store.getState()).vitalStatus).toBe(
        'WOUNDED'
      );
      expect(selectHeroVisualClass(store.getState()).vitalLabel).toBe('Herido');

      store.dispatch(takeDamage(50)); // Queda en 0 HP
      expect(selectHeroVisualClass(store.getState()).vitalStatus).toBe(
        'DEFEATED'
      );
      expect(selectHeroVisualClass(store.getState()).vitalLabel).toBe(
        'Derrotado'
      );
    });
  });

  describe('actionLogSlice (extraReducers + límite de 5 acciones)', () => {
    it('captura automáticamente acciones de stats e inventory y limita el historial a 5 eventos', () => {
      const store = createAppStore();

      store.dispatch(incrementStat('str')); // #1
      store.dispatch(incrementStat('agi')); // #2
      store.dispatch(toggleEquipItem('fire-sword')); // #3
      store.dispatch(applyBuildPreset('MAGE')); // #4
      store.dispatch(takeDamage(25)); // #5
      store.dispatch(healHero()); // #6
      store.dispatch(clearEquipment()); // #7

      const logState = store.getState().actionLog;
      expect(logState.totalDispatchedCount).toBe(7);
      expect(logState.entries).toHaveLength(5);

      // El evento más reciente está en la posición 0
      expect(logState.entries[0].type).toBe('inventory/clearEquipment');
      expect(logState.entries[1].type).toBe('stats/healHero');
      expect(logState.entries[2].type).toBe('stats/takeDamage');
      expect(logState.entries[3].type).toBe('stats/applyBuildPreset');
      expect(logState.entries[4].type).toBe('inventory/toggleEquipItem');
      expect(logState.entries[4].displayText).toBe(
        '[inventory/toggleEquipItem] -> "Espada de Fuego"'
      );

      store.dispatch(clearActionLog());
      expect(store.getState().actionLog.entries).toHaveLength(0);
    });
  });
});

