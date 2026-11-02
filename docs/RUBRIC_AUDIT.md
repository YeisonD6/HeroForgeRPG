# Auditoría de Cumplimiento de la Rúbrica (100 Puntos) — HeroForge RPG

> **Documento Auditado:** `docs/Taller Desarrollo Movil - Redux Visual (HeroForge RPG).docx.pdf` (Sección 6, Páginas 10–11)  
> **Nota Metodológica:** Este informe audita técnicamente el cumplimiento de cada criterio de la rúbrica oficial contra evidencias reales y verificables del repositorio. La calificación académica oficial final corresponde al docente de la asignatura tras evaluar el repositorio y la grabación de video del estudiante.

---

## Criterio 1: Arquitectura del Store y Slices (RTK) — Peso: 25 Puntos

### Descripción de Excelencia del Taller
> *"Configura correctamente el Store con al menos 2-3 slices separados (stats, inventory, actionLog). Utiliza PayloadAction correctamente y mantiene los componentes de UI libres de lógica de negocio pesada."*

### Auditoría y Evidencia Verificable

| Subcriterio | Estado | Archivo(s) de Evidencia | Detalle Técnico Verificado |
| :--- | :--- | :--- | :--- |
| **Configuración de `configureStore`** | Cumplido | `src/store/index.ts` | Se exporta `store` configurado con `configureStore({ reducer: { stats, inventory, actionLog } })`, además de la fábrica `createAppStore()` para pruebas aisladas, tipos `RootState`, `AppDispatch` y hooks tipados `useAppDispatch` y `useAppSelector`. |
| **Slice 1: `statsSlice`** | Cumplido | `src/store/slices/statsSlice.ts` | Estado inicial exacto (`availablePoints: 15, str: 5, agi: 5, int: 5, currentHp: 100`). Implementa `incrementStat`, `decrementStat` (validando mínimo base 1), `takeDamage`, `healHero`, `applyBuildPreset` (`'WARRIOR' \| 'MAGE' \| 'ROGUE'`) y `resetStats`. |
| **Slice 2: `inventorySlice`** | Cumplido | `src/store/slices/inventorySlice.ts` | Catálogo de 6 objetos RPG (`Espada de Fuego`, `Escudo de Titanio`, `Báculo Arcano`, `Botas Élficas`, `Armadura Maldita`, `Amuleto del Dragón`) y `equippedIds: string[]`. Implementa `toggleEquipItem` y `clearEquipment` (con alias `unequipAll`). |
| **Slice 3: `actionLogSlice`** | Cumplido | `src/store/slices/actionLogSlice.ts` | Implementa el bonus de arquitectura con `extraReducers` y `builder.addMatcher` para interceptar automáticamente todas las acciones reales de `stats/` e `inventory/`, conservando las últimas 5 entradas con su `type` y `payload` reales. |
| **Tipado con `PayloadAction<T>`** | Cumplido | `src/store/slices/*.ts` | Uso estricto de `PayloadAction<StatKey>`, `PayloadAction<BuildPreset>`, `PayloadAction<number>`, `PayloadAction<string>` sin tipos `any`. |
| **Separación de Responsabilidades** | Cumplido | `src/components/*.tsx` | Los componentes de UI solo leen selectores con `useAppSelector` y despachan acciones con `useAppDispatch`. Toda la lógica de dominio vive en `src/store/`. |

---

## Criterio 2: Uso de Estado Derivado (Selectores) — Peso: 20 Puntos

### Descripción de Excelencia del Taller
> *"Calcula estadísticas totales, límite de peso, sobrecarga y apariencia/clase del héroe cruzando múltiples slices mediante selectores limpios, sin duplicar ni guardar valores calculados dentro del estado."*

### Auditoría y Evidencia Verificable

| Subcriterio | Estado | Archivo(s) de Evidencia | Detalle Técnico Verificado |
| :--- | :--- | :--- | :--- |
| **Ausencia de duplicación en Slices** | Cumplido | `src/store/slices/statsSlice.ts`, `src/store/slices/inventorySlice.ts` | Ningún slice almacena `totalStr`, `totalWeight`, `maxWeightCapacity`, `isOverencumbered`, `combatPower` ni `heroClass`. |
| **`selectTotalStats`** | Cumplido | `src/store/selectors.ts` | Cruza `state.stats` y `state.inventory` (`selectEquippedItems`) sumando atributos base + bonos de objetos equipados. |
| **`selectTotalWeight` y `selectMaxWeightCapacity`** | Cumplido | `src/store/selectors.ts` | Calcula `totalWeight` sumando `item.weight` de los ítems equipados y `maxWeightCapacity = 10 + (totalStr * 2)`. |
| **`selectIsOverencumbered`** | Cumplido | `src/store/selectors.ts` | Retorna `totalWeight > maxWeightCapacity`. |
| **`selectCombatPower`** | Cumplido | `src/store/selectors.ts` | Calcula `rawPower = totalStr * 3 + totalAgi * 2 + totalInt * 3` y aplica `Math.round(rawPower * 0.7)` cuando `selectIsOverencumbered` es `true`. |
| **`selectHeroVisualClass`** | Cumplido | `src/store/selectors.ts` | Calcula dinámicamente clase (`Novato`, `Berserker Implacable`, `Archimago Arcano`, `Asesino Sombrío`, `Tanque Pesado`), arquetipo, color de aura, ícono de arma en mano y estado vital (`Sano`, `Herido`, `Derrotado`). |
| **Memoización con `createSelector`** | Cumplido | `src/store/selectors.ts` | Todos los selectores derivados están construidos con `createSelector` de `@reduxjs/toolkit`. |

---

## Criterio 3: Feedback Visual y Reactividad Gráfica — Peso: 25 Puntos

### Descripción de Excelencia del Taller
> *"La interfaz permite 'ver' Redux en acción: barras de progreso dinámicas, cambio de colores/estados del avatar, alertas de sobrecarga y consola visual de acciones despachadas en tiempo real. Cero uso de prop drilling entre las 4 zonas."*

### Auditoría y Evidencia Verificable

| Subcriterio | Estado | Archivo(s) de Evidencia | Detalle Técnico Verificado |
| :--- | :--- | :--- | :--- |
| **Cuatro Zonas Independientes sin Prop Drilling** | Cumplido | `App.tsx` | `<HeroAvatarHUD />`, `<StatsControlPanel />`, `<ArmoryGrid />` y `<ReduxLiveInspector />` son componentes hermanos que reciben 0 props. |
| **Avatar Dinámico y Barras de Progreso (Zona A)** | Cumplido | `src/components/HeroAvatarHUD.tsx` | Muestra avatar con aura dinámica según clase, expresión según HP (`😤` / `😣` / `💀`), ícono de arma equipada en mano y 3 barras reactivas: Vida (HP), Energía/Maná y Carga de Peso (Verde → Amarillo → Rojo). |
| **Panel de Entrenamiento y Presets (Zona B)** | Cumplido | `src/components/StatsControlPanel.tsx` | Botones `-` y `+` con bloqueo en límites (`<= 1` o `availablePoints === 0`), barras de nivel base + bono de ítem, 3 presets (`WARRIOR`, `MAGE`, `ROGUE`) y Poción de Reseteo. |
| **Armería y Alerta de Sobrecarga (Zona C)** | Cumplido | `src/components/ArmoryGrid.tsx` | Cuadrícula de 6 tarjetas con borde dorado brillante al equipar, botón `Desequipar Todo` y banner rojo `"⚠️ ¡SOBRECARGADO! (-50% Velocidad)"`. |
| **Simulador de Boss e Inspector en Vivo (Zona D)** | Cumplido | `src/components/ReduxLiveInspector.tsx` | Simulador contra *Ignis, Señor del Abismo* (250 HP) usando `selectCombatPower`, contraataque real (`takeDamage`), curación (`healHero`), reinicio y consola en tiempo real con las últimas 5 acciones (`[slice/action] -> payload`). |

---

## Criterio 4: Claridad Técnica en el Video Explicativo — Peso: 30 Puntos

### Descripción de Excelencia del Taller
> *"El estudiante demuestra dominio propio del código: explica con precisión el flujo Action → Reducer → Store → Selector, conecta la explicación teórica con lo que ocurre visualmente en su app y responde con criterio cuándo usar estado local vs. global."*

### Auditoría y Evidencia Verificable

| Subcriterio | Estado | Archivo(s) de Evidencia | Detalle Técnico Verificado |
| :--- | :--- | :--- | :--- |
| **Guion Estructurado en 4 Momentos (6:30 min)** | Guion Listo (Grabación a cargo del estudiante) | `docs/VIDEO_SCRIPT.md` | Incluye narración palabra por palabra, pantalla a mostrar, archivo a abrir, acción a ejecutar y concepto demostrado para los 4 bloques: `0:00–1:30`, `1:30–3:30`, `3:30–5:30` y `5:30–6:30`. |
| **Explicación de Flujo Redux, Immer y Selectores** | Guion Listo | `docs/VIDEO_SCRIPT.md` | Explica el ciclo unidireccional, el uso de borradores inmutables con Immer en los reducers, `PayloadAction` y por qué `selectCombatPower` y `selectIsOverencumbered` son estados derivados. |
| **Comparación `useState` vs. Redux Toolkit** | Guion Listo | `docs/VIDEO_SCRIPT.md`, `src/components/ReduxLiveInspector.tsx` | Demuestra con un caso real del proyecto por qué `bossHp` usa `useState` local en la arena mientras que las estadísticas, inventario y log usan Redux Toolkit. |

---

## Resumen de Verificación Automatizada
- **TypeScript (`npm run typecheck`):** `0` errores (`strict: true`).
- **ESLint (`npm run lint`):** `0` errores y `0` advertencias.
- **Jest + React Native Testing Library (`npm test`):** `2` suites aprobadas (`store.test.ts` y `HeroForgeApp.test.tsx`), `19` pruebas automatizadas ejecutadas y aprobadas al 100%.

