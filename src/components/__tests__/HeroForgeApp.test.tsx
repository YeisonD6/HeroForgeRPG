import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import { HeroForgeScreen } from '../../../App';
import { createAppStore } from '../../store';

function renderWithFreshStore() {
  const store = createAppStore();
  const utils = render(
    <Provider store={store}>
      <HeroForgeScreen />
    </Provider>
  );
  return { ...utils, store };
}

describe('HeroForge RPG — Integración Visual de las 4 Zonas y Efecto Dominó', () => {
  it('renderiza las 4 zonas independientes con el estado inicial correcto', () => {
    const { getByTestId } = renderWithFreshStore();

    expect(getByTestId('zone-a-hud')).toBeTruthy();
    expect(getByTestId('zone-b-stats')).toBeTruthy();
    expect(getByTestId('zone-c-armory')).toBeTruthy();
    expect(getByTestId('zone-d-inspector')).toBeTruthy();

    // Valores iniciales en el HUD (Zona A)
    expect(getByTestId('hud-hero-class').props.children).toBe('Novato');
    expect(getByTestId('hud-combat-power').props.children).toContain(40);
    expect(getByTestId('hud-total-str').props.children).toBe(5);
    expect(getByTestId('hud-total-agi').props.children).toBe(5);
    expect(getByTestId('hud-total-int').props.children).toBe(5);

    // Puntos iniciales en Zona B
    expect(getByTestId('stats-available-points').props.children).toContain(15);
  });

  it('demuestra el EFECTO DOMINÓ al equipar la Espada de Fuego en una sola acción', () => {
    const { getByTestId } = renderWithFreshStore();

    // Tocar tarjeta de Espada de Fuego en Zona C
    fireEvent.press(getByTestId('armory-item-fire-sword'));

    // 1. Zona C muestra el ítem como EQUIPADO
    expect(getByTestId('armory-status-fire-sword').props.children).toBe(
      '✨ EQUIPADO'
    );

    // 2. Zona A actualiza Fuerza Total (5 + 10 = 15) y Agilidad Total (5 + 2 = 7)
    expect(getByTestId('hud-total-str').props.children).toBe(15);
    expect(getByTestId('hud-total-agi').props.children).toBe(7);

    // 3. Zona A recalcula el Poder de Combate (15*3 + 7*2 + 5*3 = 74)
    expect(getByTestId('hud-combat-power').props.children).toContain(74);

    // 4. Zona A recalcula Peso y Capacidad (10 / 40 Kg)
    expect(getByTestId('hud-weight-text').props.children).toEqual([
      10,
      ' / ',
      40,
      ' Kg',
    ]);

    // 5. Zona A cambia la clase del Avatar a Berserker Implacable y el arma en mano
    expect(getByTestId('hud-hero-class').props.children).toBe(
      'Berserker Implacable'
    );

    // 6. Zona D registra la acción en el Inspector Redux en tiempo real
    expect(getByTestId('log-total-count').props.children).toEqual([
      'Total Dispatches: ',
      1,
    ]);
    expect(getByTestId('log-entry-0')).toBeTruthy();
  });

  it('permite incrementar, decrementar, aplicar presets, resetear stats y limpiar equipamiento desde la UI', () => {
    const { getByTestId } = renderWithFreshStore();

    // Incrementar STR y AGI desde Zona B
    fireEvent.press(getByTestId('btn-increment-str'));
    fireEvent.press(getByTestId('btn-increment-agi'));
    expect(getByTestId('hud-total-str').props.children).toBe(6);
    expect(getByTestId('hud-total-agi').props.children).toBe(6);
    expect(getByTestId('stats-available-points').props.children).toContain(13);

    // Decrementar STR recupera punto
    fireEvent.press(getByTestId('btn-decrement-str'));
    expect(getByTestId('hud-total-str').props.children).toBe(5);
    expect(getByTestId('stats-available-points').props.children).toContain(14);

    // Aplicar preset ROGUE cambia la clase a Asesino Sombrío
    fireEvent.press(getByTestId('btn-preset-rogue'));
    expect(getByTestId('hud-hero-class').props.children).toBe(
      'Asesino Sombrío'
    );

    // Resetear stats con Poción de Reseteo vuelve a Novato y 15 puntos
    fireEvent.press(getByTestId('btn-reset-stats'));
    expect(getByTestId('hud-hero-class').props.children).toBe('Novato');
    expect(getByTestId('stats-available-points').props.children).toContain(15);

    // Equipar 2 objetos y usar Desequipar Todo
    fireEvent.press(getByTestId('armory-item-fire-sword'));
    fireEvent.press(getByTestId('armory-item-elven-boots'));
    expect(getByTestId('hud-total-str').props.children).toBe(15);
    fireEvent.press(getByTestId('btn-clear-equipment'));
    expect(getByTestId('hud-total-str').props.children).toBe(5);
    expect(getByTestId('armory-status-fire-sword').props.children).toBe(
      'EN MOCHILA'
    );
  });

  it('activa la alerta "¡SOBRECARGADO! (-50% Velocidad)" y penaliza el poder en 30% al superar capacidad', () => {
    const { getByTestId, queryByTestId } = renderWithFreshStore();

    // Inicialmente sin sobrecarga
    expect(queryByTestId('armory-overload-alert')).toBeNull();

    // Equipar Armadura Maldita (24 Kg, +2 STR) y Escudo de Titanio (18 Kg, +2 STR)
    // Peso total = 42 Kg > Capacidad máxima (10 + 9*2 = 28 Kg)
    fireEvent.press(getByTestId('armory-item-cursed-armor'));
    fireEvent.press(getByTestId('armory-item-titanium-shield'));

    // Aparece alerta de sobrecarga en Zona C y en Zona A
    expect(getByTestId('armory-overload-alert')).toBeTruthy();
    expect(getByTestId('hud-overload-banner')).toBeTruthy();

    // Poder bruto = 76 -> Penalizado 30% = Math.round(76 * 0.7) = 53
    expect(getByTestId('hud-combat-power').props.children).toContain(53);

    // Al entrenar STR o usar preset WARRIOR, la capacidad sube y desaparece la sobrecarga
    fireEvent.press(getByTestId('btn-preset-warrior'));
    // Con WARRIOR (str base 16 + 4 de ítems = 20 STR -> Capacidad = 10 + 40 = 50 Kg >= 42 Kg)
    expect(queryByTestId('armory-overload-alert')).toBeNull();
  });

  it('ejecuta simulación de combate (victoria y derrota), actualiza estado vital del Avatar y limita el log visual a 5 eventos', () => {
    const { getByTestId, queryByTestId } = renderWithFreshStore();

    // Aplicar preset MAGE (Poder: 83) y equipar Báculo Arcano (+1 AGI, +12 INT -> Poder: 5*3 + 8*2 + 30*3 = 121)
    fireEvent.press(getByTestId('btn-preset-mage'));
    fireEvent.press(getByTestId('armory-item-arcane-staff'));
    expect(getByTestId('hud-combat-power').props.children).toContain(121);

    // Atacar al Boss 3 veces para derrotarlo (250 HP -> 129 -> 8 -> 0)
    fireEvent.press(getByTestId('btn-attack-boss'));
    fireEvent.press(getByTestId('btn-attack-boss'));
    fireEvent.press(getByTestId('btn-attack-boss'));
    expect(getByTestId('boss-hp-text').props.children).toEqual([0, ' / ', 250]);
    expect(getByTestId('combat-state-badge').props.children).toContain(
      'VICTORIA'
    );

    // Reiniciar arena y probar estado Derrotado del héroe (4 golpes de -30 HP)
    fireEvent.press(getByTestId('btn-reset-combat'));
    fireEvent.press(getByTestId('btn-take-damage'));
    fireEvent.press(getByTestId('btn-take-damage'));
    expect(getByTestId('hud-vital-status').props.children).toContain('Herido');
    fireEvent.press(getByTestId('btn-take-damage'));
    fireEvent.press(getByTestId('btn-take-damage'));
    expect(getByTestId('hud-vital-status').props.children).toContain(
      'Derrotado'
    );

    // Curar al héroe al 100%
    fireEvent.press(getByTestId('btn-heal-hero'));
    expect(getByTestId('hud-vital-status').props.children).toContain('Sano');

    // Verificar que la consola Redux muestra exactamente 5 eventos aunque hubo más de 8 dispatches
    expect(getByTestId('log-entry-0')).toBeTruthy();
    expect(getByTestId('log-entry-4')).toBeTruthy();
    expect(queryByTestId('log-entry-5')).toBeNull();
  });
});
