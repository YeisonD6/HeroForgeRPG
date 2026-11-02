---
trigger: always_on
description: Redux Toolkit architecture, slices, actions, and derived state selector rules for HeroForge RPG
---

# Redux Toolkit Architecture Rules (HeroForge RPG)

1. **Single Source of Truth**: All shared state across the four visual zones (`HeroAvatarHUD`, `StatsControlPanel`, `ArmoryGrid`, `ReduxLiveInspector`) must live in the Redux Toolkit store (`src/store/index.ts`).
2. **Zero Prop Drilling**: The four main visual zone components must be sibling components that receive zero state or callback props from `App.tsx`. They must communicate exclusively through `useAppSelector` and `useAppDispatch`.
3. **Three Mandatory Slices**:
   - `statsSlice` (`src/store/slices/statsSlice.ts`): Manages base attributes (`str: 5`, `agi: 5`, `int: 5`), `availablePoints: 15`, and `currentHp: 100`. Exposes `incrementStat`, `decrementStat`, `takeDamage`, `healHero`, `applyBuildPreset`, and `resetStats`.
   - `inventorySlice` (`src/store/slices/inventorySlice.ts`): Manages the item `catalog` (at least 6 RPG items) and `equippedIds: string[]`. Exposes `toggleEquipItem` and `clearEquipment`.
   - `actionLogSlice` (`src/store/slices/actionLogSlice.ts`): Stores the last 5 real dispatched Redux actions (action `type`, formatted `payload`, timestamp) captured automatically via `extraReducers` (`builder.addMatcher`).
4. **No Derived State in Slices (Golden Rule)**:
   - Never store `totalStr`, `totalAgi`, `totalInt`, `totalWeight`, `maxWeightCapacity`, `isOverencumbered`, `combatPower`, or `heroVisualClass` inside any slice state.
   - Always compute derived values in `src/store/selectors.ts` using pure and memoized selectors (`createSelector`).
5. **Strict Typing**:
   - Always use `PayloadAction<T>` for reducers that accept parameters.
   - Always use typed hooks `useAppDispatch` and `useAppSelector` in UI components.

