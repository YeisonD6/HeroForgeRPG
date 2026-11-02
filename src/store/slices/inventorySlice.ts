import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ItemCategory =
  | 'Arma'
  | 'Defensa'
  | 'Magia'
  | 'Velocidad'
  | 'Armadura Pesada'
  | 'Reliquia Mítica';

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  weight: number;
  description: string;
}

export interface InventoryState {
  catalog: InventoryItem[];
  equippedIds: string[];
}

export const INITIAL_CATALOG: InventoryItem[] = [
  {
    id: 'fire-sword',
    name: 'Espada de Fuego',
    icon: '🗡️',
    category: 'Arma',
    bonusStr: 10,
    bonusAgi: 2,
    bonusInt: 0,
    weight: 10,
    description: 'Hoja forjada en magma volcánico que desata furia física.',
  },
  {
    id: 'titanium-shield',
    name: 'Escudo de Titanio',
    icon: '🛡️',
    category: 'Defensa',
    bonusStr: 2,
    bonusAgi: 0,
    bonusInt: 2,
    weight: 18,
    description: 'Muralla impenetrable de aleación pesada para tanques.',
  },
  {
    id: 'arcane-staff',
    name: 'Báculo Arcano',
    icon: '🪄',
    category: 'Magia',
    bonusStr: 0,
    bonusAgi: 1,
    bonusInt: 12,
    weight: 5,
    description: 'Canalizador astral que amplifica el maná y hechizos.',
  },
  {
    id: 'elven-boots',
    name: 'Botas Élficas',
    icon: '👢',
    category: 'Velocidad',
    bonusStr: 0,
    bonusAgi: 10,
    bonusInt: 2,
    weight: 2,
    description: 'Calzado ultraligero tejido con viento de los bosques.',
  },
  {
    id: 'cursed-armor',
    name: 'Armadura Maldita',
    icon: '⛓️',
    category: 'Armadura Pesada',
    bonusStr: 2,
    bonusAgi: 0,
    bonusInt: 6,
    weight: 24,
    description: 'Coraza abisal de gran poder oscuro pero peso abrumador.',
  },
  {
    id: 'dragon-amulet',
    name: 'Amuleto del Dragón',
    icon: '🐉',
    category: 'Reliquia Mítica',
    bonusStr: 4,
    bonusAgi: 4,
    bonusInt: 4,
    weight: 3,
    description: 'Talismán ancestral que equilibra fuerza, agilidad y magia.',
  },
];

export const initialInventoryState: InventoryState = {
  catalog: INITIAL_CATALOG,
  equippedIds: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: initialInventoryState,
  reducers: {
    toggleEquipItem(state, action: PayloadAction<string>) {
      const itemId = action.payload;
      const itemExists = state.catalog.some((item) => item.id === itemId);
      if (!itemExists) {
        return;
      }
      const existingIndex = state.equippedIds.indexOf(itemId);
      if (existingIndex >= 0) {
        state.equippedIds.splice(existingIndex, 1);
      } else {
        state.equippedIds.push(itemId);
      }
    },
    clearEquipment(state) {
      state.equippedIds = [];
    },
  },
});

export const { toggleEquipItem, clearEquipment } = inventorySlice.actions;

// Alias de compatibilidad con la tabla de la pág. 4 del PDF
export const unequipAll = inventorySlice.actions.clearEquipment;

export default inventorySlice.reducer;

