# Guion Oficial del Video Académico — HeroForge RPG

> **Duración Objetivo:** 6 minutos y 30 segundos (Rango permitido por el taller: 5:00 a 7:00 minutos)  
> **Asignatura:** Desarrollo Móvil — Universidad de La Sabana  
> **Configuración de Grabación:** Pantalla dividida (Izquierda: Editor de Código VS Code / Antigravity | Derecha: Aplicación **HeroForge RPG** ejecutándose en vivo en Expo / Emulador / Web). Cámara o micrófono activo narrando con claridad técnica.

---

## MOMENTO 1 (0:00 – 1:30) | El Problema Arquitectónico y el Flujo Unidireccional de Redux

### Metadatos de Escena
- **Pantalla que debo mostrar:** Vista dividida con `App.tsx` abierto en el editor a la izquierda y la aplicación **HeroForge RPG** corriendo en su estado inicial a la derecha (mostrando las 4 zonas: Zona A Avatar HUD, Zona B Entrenamiento, Zona C Armería y Zona D Arena + Consola Redux).
- **Archivo que debo abrir:** `App.tsx` (líneas 23–55, donde se observan `<HeroAvatarHUD />`, `<StatsControlPanel />`, `<ArmoryGrid />` y `<ReduxLiveInspector />` sin recibir ninguna prop).
- **Acción que debo ejecutar:** Señalar con el cursor en `App.tsx` cómo los cuatro componentes se renderizan como hermanos directos sin pasarse props entre sí, y hacer un recorrido visual rápido de arriba hacia abajo en la app móvil.
- **Concepto que estoy demostrando:** Antipatrones de *Prop Drilling* y *Estado Desincronizado/Redundante* frente a una Fuente Única de Verdad (*Single Source of Truth*) y el ciclo unidireccional de Redux Toolkit.

### Texto Exacto para Narrar (0:00 – 1:30)
> "Hola, bienvenidos a la presentación técnica de **HeroForge RPG**, desarrollada para la asignatura de Desarrollo Móvil en la Universidad de La Sabana.
>
> En este proyecto resolvemos un problema arquitectónico clásico de las aplicaciones móviles interactivas: **¿qué pasaría si intentáramos conectar el Avatar Superior (Zona A), el Panel de Atributos (Zona B), la Armería de objetos (Zona C) y la Arena de Combate con su Consola de Eventos (Zona D) usando únicamente `useState` y pasando props?**
>
> Caeríamos inmediatamente en dos antipatrones críticos:
> 1. Primero, **Prop Drilling (perforación de props)**: tendríamos que elevar todo el estado al componente raíz y pasar decenas de variables y callbacks a través de componentes intermedios que no deberían acoplarse entre sí.
> 2. Segundo, **Estado Desincronizado y Redundante**: si intentáramos guardar variables calculadas —como el peso total, si el héroe está sobrecargado o su poder de combate— en múltiples `useState` locales, cualquier cambio en un atributo o en un ítem equipado dejaría la interfaz con datos contradictorios.
>
> Como pueden ver aquí en `App.tsx`, nuestras cuatro zonas visuales (`HeroAvatarHUD`, `StatsControlPanel`, `ArmoryGrid` y `ReduxLiveInspector`) son componentes hermanos completamente independientes con **cero prop drilling**.
>
> Todo funciona gracias al **ciclo unidireccional de Redux Toolkit**:
> 1. Un **Componente de UI** dispara una intención mediante `dispatch(Action)`.
> 2. La acción viaja al **Store** y es procesada por el **Reducer** puro de su Slice correspondiente.
> 3. El **State** global se actualiza de forma inmutable.
> 4. Los **Selectores Derivados** recalculan al vuelo las fórmulas matemáticas cruzando múltiples slices.
> 5. Y finalmente ocurre el **Re-render visual automático** únicamente en los componentes suscritos."

---

## MOMENTO 2 (1:30 – 3:30) | Demostración Visual en Vivo: "El Efecto Dominó", Sobrecarga y Combate

### Metadatos de Escena
- **Pantalla que debo mostrar:** Aplicación **HeroForge RPG** en primer plano para que se aprecien claramente las 4 zonas simultáneamente.
- **Archivo que debo abrir:** Mantener visible la app móvil interactiva (opcionalmente con `src/store/selectors.ts` de fondo).
- **Acción que debo ejecutar:**
  1. Tocar la tarjeta **"Espada de Fuego"** en la Zona C (`ArmoryGrid`).
  2. Tocar el botón de preset **"MAGE"** y luego **"WARRIOR"** en la Zona B (`StatsControlPanel`), y luego tocar **"Poción de Reseteo"**.
  3. Equipar **"Armadura Maldita"** (24 Kg) y **"Escudo de Titanio"** (18 Kg) en la Zona C para provocar el estado de **Sobrecarga** (`42 / 28 Kg`).
  4. Presionar **`+` en Fuerza (STR)** o el preset **"WARRIOR"** para superar el límite de peso y eliminar la sobrecarga.
  5. En la Zona D (`ReduxLiveInspector`), presionar **"Atacar Boss"**, luego **"Recibir Daño (-30 HP)"** dos veces para ver al Avatar pasar a estado *Herido*, y finalmente **"Curar Héroe"**.
- **Concepto que estoy demostrando:** Reactividad global en tiempo real ("Efecto Dominó"), cálculo dinámico de capacidad de carga, doble efecto de la sobrecarga (`-50% Velocidad` visual y `-30% Poder de Combate` matemático) y trazabilidad real de las últimas 5 acciones.

### Texto Exacto para Narrar (1:30 – 3:30)
> "Pasemos ahora a la demostración en vivo del **Efecto Dominó de Redux**.
>
> Observen el estado inicial: nuestro héroe es un **Novato (Aldeano)** con aura gris, 5 puntos base en cada atributo, 0 de 20 kilogramos de carga y 40 de Poder de Combate.
>
> Ahora haré **un solo toque** en la Zona C para equipar la **Espada de Fuego**. Observen cómo una única acción transforma las cuatro zonas al instante:
> 1. En la **Zona C**, la tarjeta de la Espada de Fuego se ilumina como equipada.
> 2. En la **Zona A**, la Fuerza Total sube de 5 a 15 (`5 base + 10 del arma`) y la Agilidad sube a 7.
> 3. El **Poder de Combate** sube automáticamente de 40 a 74.
> 4. La **Capacidad Máxima de Peso** sube de 20 a 40 Kg gracias a la nueva Fuerza, marcando 10 de 40 Kg en verde.
> 5. El **Avatar** detecta que la Fuerza superó los 15 puntos, cambia su clase a **Berserker Implacable (Guerrero Berserker)**, enciende su aura roja y empuña la espada.
> 6. Y abajo, en la **Zona D**, el Inspector Redux registra en vivo `[inventory/toggleEquipItem] -> "Espada de Fuego"`.
>
> Ahora provoquemos intencionalmente la **Sobrecarga de Peso**: reseteo las estadísticas y equipo la **Armadura Maldita** (24 Kg) junto con el **Escudo de Titanio** (18 Kg). El peso sube a **42 Kg**, superando la capacidad máxima de **28 Kg**.
>
> Inmediatamente ocurren dos efectos distintos tal como exige el taller:
> - Primero, aparece la alerta roja **`¡SOBRECARGADO! (-50% Velocidad)`** tanto en la Armería como en el HUD y la barra de carga se vuelve roja.
> - Segundo, el **Poder de Combate** sufre la penalización matemática del 30%, bajando de 76 bruto a **53 efectivo**.
>
> Si en la Zona B aplico el preset **WARRIOR** en un solo dispatch, la Fuerza sube a 20, la capacidad máxima sube a 50 Kg y la sobrecarga desaparece al instante, restaurando el poder al 100%.
>
> Finalmente, en la **Zona D (Arena de Combate)**, ataco al Boss *Ignis* aplicando mi Poder de Combate real. El Boss contraataca reduciendo mi HP. Si recibo más daño, el Avatar cambia su expresión y estado a **Herido**, y si llega a 0 HP pasa a **Derrotado**. Con **Curar Héroe**, despachamos `healHero` y el personaje recupera sus 100 puntos de vida mientras la Consola Redux mantiene siempre las últimas 5 acciones."

---

## MOMENTO 3 (3:30 – 5:30) | Recorrido por el Código: Store, Slices, Immer y Selectores Derivados

### Metadatos de Escena
- **Pantalla que debo mostrar:** Editor de código en pantalla principal mostrando los archivos de `src/store/`.
- **Archivo que debo abrir:**
  1. `src/store/index.ts` (configuración del Store y hooks tipados).
  2. `src/store/slices/statsSlice.ts` y `src/store/slices/inventorySlice.ts` (reducers con `PayloadAction` e inmutabilidad con Immer).
  3. `src/store/slices/actionLogSlice.ts` (captura reactiva con `extraReducers` y `builder.addMatcher`).
  4. `src/store/selectors.ts` (los 5 selectores derivados memoizados).
- **Acción que debo ejecutar:** Abrir cada uno de los 4 archivos en orden y resaltar los bloques clave mientras los explico.
- **Concepto que estoy demostrando:** Configuración profesional de Redux Toolkit, tipado estricto con `PayloadAction`, funcionamiento interno de **Immer**, intercepción de acciones con `addMatcher` y la **Regla de Oro del Estado Derivado** con `createSelector`.

### Texto Exacto para Narrar (3:30 – 5:30)
> "Veamos ahora cómo está construida esta arquitectura en el código dentro de `src/store/`.
>
> Primero, en **`src/store/index.ts`**, configuramos el Store central mediante `configureStore`, combinando exactamente nuestros tres slices: `stats`, `inventory` y `actionLog`. Además, inferimos los tipos `RootState` y `AppDispatch` directamente del store y exportamos los hooks tipados `useAppDispatch` y `useAppSelector` para garantizar TypeScript estricto en toda la interfaz.
>
> Segundo, abrimos **`src/store/slices/statsSlice.ts`** e **`inventorySlice.ts`**. Observen reducers como `applyBuildPreset(state, action: PayloadAction<BuildPreset>)` o `toggleEquipItem(state, action: PayloadAction<string>)`.
> Aquí es fundamental explicar cómo **Redux Toolkit maneja la inmutabilidad por debajo mediante Immer**: aunque escribimos código legible como `state.equippedIds.push(itemId)` o `state[stat] += 1`, **no estamos mutando el estado real**. Immer intercepta estas operaciones sobre un borrador (*Proxy draft*) y produce un nuevo árbol de estado completamente inmutable, mientras `action.payload` transporta de forma tipada únicamente el dato mínimo necesario (como el ID `'fire-sword'` o el preset `'WARRIOR'`).
>
> En **`src/store/slices/actionLogSlice.ts`**, implementamos el bonus de arquitectura usando `extraReducers` con `builder.addMatcher`. En lugar de ensuciar los componentes despachando logs manuales, este matcher escucha automáticamente cualquier acción de `stats/` o `inventory/`, formatea su payload y mantiene una cola FIFO de máximo 5 eventos reales.
>
> Y tercero, abrimos **`src/store/selectors.ts`**, donde cumplimos la **Regla de Oro del taller: prohibido guardar valores calculados en los slices**.
> Ni el poder de combate, ni el peso total, ni la sobrecarga existen como variables dentro de `statsSlice` o `inventorySlice`. En su lugar, usamos selectores memoizados con `createSelector`:
> - `selectTotalStats` cruza los atributos base de `statsSlice` con los bonos de los ítems activos de `inventorySlice`.
> - `selectMaxWeightCapacity` calcula `10 + (totalStr * 2)` y `selectIsOverencumbered` compara `totalWeight > maxWeightCapacity`.
> - `selectCombatPower` calcula `totalStr * 3 + totalAgi * 2 + totalInt * 3` y, si `selectIsOverencumbered` es verdadero, aplica `Math.round(rawPower * 0.7)`.
> - Y `selectHeroVisualClass` determina dinámicamente la clase, el color de aura y el estado vital del avatar. Al ser estados derivados, es matemáticamente imposible que se desincronicen."

---

## MOMENTO 4 (5:30 – 6:30) | Conclusión y Criterio Arquitectónico: `useState` vs. Redux Toolkit

### Metadatos de Escena
- **Pantalla que debo mostrar:** `src/components/ReduxLiveInspector.tsx` abierto junto a la aplicación funcionando.
- **Archivo que debo abrir:** `src/components/ReduxLiveInspector.tsx` (líneas 23–28, donde se comparan los hooks `useAppSelector` globales con el `useState` local del Boss).
- **Acción que debo ejecutar:** Señalar cómo conviven armónicamente `useState` para el estado estrictamente local de la arena y Redux Toolkit para el estado compartido del héroe.
- **Concepto que estoy demostrando:** Criterio de ingeniería de software para elegir entre estado local (`useState`) y estado global (`Redux Toolkit`) en proyectos móviles reales.

### Texto Exacto para Narrar (5:30 – 6:30)
> "Para concluir, respondamos la pregunta clave de arquitectura móvil: **¿En qué momento de un proyecto real debemos usar estado local con `useState` y cuándo debemos escalar a un Store global como Redux Toolkit?**
>
> De hecho, nuestra propia aplicación **HeroForge RPG** ejemplifica ambos casos en `ReduxLiveInspector.tsx`:
> - Usamos **`useState` (estado local)** cuando el dato pertenece exclusivamente a un único componente, es efímero y ningún otro componente hermano necesita conocerlo: por ejemplo, la vida actual del Boss dentro del simulador de combate (`bossHp`) o si un modal/input local está abierto. Meter eso en Redux añadiría complejidad innecesaria.
> - En cambio, escalamos a **Redux Toolkit (estado global)** cuando:
>   1. El estado es compartido por múltiples vistas o zonas distantes de la aplicación (como los atributos, el inventario y la vida de nuestro héroe).
>   2. Necesitamos combinar fuentes de datos mediante **selectores derivados memoizados** sin duplicar información.
>   3. Una sola acción del usuario debe desencadenar actualizaciones coordinadas en toda la interfaz (el Efecto Dominó).
>   4. Y requerimos trazabilidad clara y predecible del flujo de acciones, como demostramos en nuestra Consola Redux en vivo.
>
> Con esto completamos la demostración técnica y funcional de **HeroForge RPG**. ¡Muchas gracias!"

