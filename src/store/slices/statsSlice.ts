import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StatKey = 'str' | 'agi' | 'int';
export type BuildPreset = 'WARRIOR' | 'MAGE' | 'ROGUE';

export interface StatsState {
  availablePoints: number;
  str: number;
  agi: number;
  int: number;
  currentHp: number;
}

export const MAX_HERO_HP = 100;
export const INITIAL_AVAILABLE_POINTS = 15;
export const INITIAL_BASE_STAT = 5;
export const MIN_BASE_STAT = 1;

export const initialStatsState: StatsState = {
  availablePoints: INITIAL_AVAILABLE_POINTS,
  str: INITIAL_BASE_STAT,
  agi: INITIAL_BASE_STAT,
  int: INITIAL_BASE_STAT,
  currentHp: MAX_HERO_HP,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState: initialStatsState,
  reducers: {
    incrementStat(state, action: PayloadAction<StatKey>) {
      const stat = action.payload;
      if (state.availablePoints > 0) {
        state[stat] += 1;
        state.availablePoints -= 1;
      }
    },
    decrementStat(state, action: PayloadAction<StatKey>) {
      const stat = action.payload;
      if (state[stat] > MIN_BASE_STAT) {
        state[stat] -= 1;
        state.availablePoints += 1;
      }
    },
    takeDamage(state, action: PayloadAction<number>) {
      const damage = Math.max(0, Math.round(action.payload));
      state.currentHp = Math.max(0, state.currentHp - damage);
    },
    healHero(state, action: PayloadAction<number | undefined>) {
      if (typeof action.payload === 'number') {
        const healAmount = Math.max(0, Math.round(action.payload));
        state.currentHp = Math.min(MAX_HERO_HP, state.currentHp + healAmount);
      } else {
        state.currentHp = MAX_HERO_HP;
      }
    },
    applyBuildPreset(state, action: PayloadAction<BuildPreset>) {
      switch (action.payload) {
        case 'WARRIOR':
          // Base (5,5,5) + (+11 STR, +3 AGI, +1 INT) = 15 pts distributed
          state.str = 16;
          state.agi = 8;
          state.int = 6;
          state.availablePoints = 0;
          break;
        case 'MAGE':
          // Base (5,5,5) + (+0 STR, +2 AGI, +13 INT) = 15 pts distributed
          state.str = 5;
          state.agi = 7;
          state.int = 18;
          state.availablePoints = 0;
          break;
        case 'ROGUE':
          // Base (5,5,5) + (+2 STR, +12 AGI, +1 INT) = 15 pts distributed
          state.str = 7;
          state.agi = 17;
          state.int = 6;
          state.availablePoints = 0;
          break;
      }
    },
    resetStats(state) {
      state.availablePoints = INITIAL_AVAILABLE_POINTS;
      state.str = INITIAL_BASE_STAT;
      state.agi = INITIAL_BASE_STAT;
      state.int = INITIAL_BASE_STAT;
      state.currentHp = MAX_HERO_HP;
    },
  },
});

export const {
  incrementStat,
  decrementStat,
  takeDamage,
  healHero,
  applyBuildPreset,
  resetStats,
} = statsSlice.actions;

// Alias de compatibilidad con la tabla de la pág. 3 del PDF
export const applyPreset = statsSlice.actions.applyBuildPreset;

export default statsSlice.reducer;

