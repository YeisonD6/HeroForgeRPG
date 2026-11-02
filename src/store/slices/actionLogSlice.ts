import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INITIAL_CATALOG } from './inventorySlice';

export const MAX_ACTION_LOG_ENTRIES = 5;

export interface ActionLogEntry {
  id: string;
  type: string;
  payload: unknown;
  formattedPayload: string;
  displayText: string;
  timestamp: string;
}

export interface ActionLogState {
  entries: ActionLogEntry[];
  totalDispatchedCount: number;
}

export const initialActionLogState: ActionLogState = {
  entries: [],
  totalDispatchedCount: 0,
};

interface PayloadCarrier extends Action {
  payload?: unknown;
}

function isTrackedDomainAction(action: Action): action is PayloadCarrier {
  return (
    typeof action.type === 'string' &&
    (action.type.startsWith('stats/') || action.type.startsWith('inventory/'))
  );
}

function formatActionPayload(type: string, payload: unknown): string {
  if (type === 'inventory/toggleEquipItem' && typeof payload === 'string') {
    const matchedItem = INITIAL_CATALOG.find((item) => item.id === payload);
    return matchedItem ? `"${matchedItem.name}"` : `"${payload}"`;
  }

  if (type === 'inventory/clearEquipment') {
    return '"Vaciar equipamiento"';
  }

  if (
    (type === 'stats/incrementStat' || type === 'stats/decrementStat') &&
    typeof payload === 'string'
  ) {
    return `"${payload.toUpperCase()}"`;
  }

  if (type === 'stats/applyBuildPreset' && typeof payload === 'string') {
    return `"Preset ${payload}"`;
  }

  if (type === 'stats/takeDamage' && typeof payload === 'number') {
    return `"-${payload} HP"`;
  }

  if (type === 'stats/healHero') {
    return typeof payload === 'number' ? `"+${payload} HP"` : '"HP Restaurado"';
  }

  if (type === 'stats/resetStats') {
    return '"Poción de Reseteo"';
  }

  if (payload === undefined) {
    return 'void';
  }

  return typeof payload === 'string' ? `"${payload}"` : JSON.stringify(payload);
}

function getCurrentTimeLabel(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const actionLogSlice = createSlice({
  name: 'actionLog',
  initialState: initialActionLogState,
  reducers: {
    clearActionLog(state) {
      state.entries = [];
      state.totalDispatchedCount = 0;
    },
    recordManualAction(
      state,
      action: PayloadAction<{ type: string; payload?: unknown }>
    ) {
      state.totalDispatchedCount += 1;
      const formattedPayload = formatActionPayload(
        action.payload.type,
        action.payload.payload
      );
      const entry: ActionLogEntry = {
        id: `log-${state.totalDispatchedCount}`,
        type: action.payload.type,
        payload: action.payload.payload,
        formattedPayload,
        displayText: `[${action.payload.type}] -> ${formattedPayload}`,
        timestamp: getCurrentTimeLabel(),
      };
      state.entries.unshift(entry);
      if (state.entries.length > MAX_ACTION_LOG_ENTRIES) {
        state.entries.length = MAX_ACTION_LOG_ENTRIES;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isTrackedDomainAction, (state, action) => {
      state.totalDispatchedCount += 1;
      const formattedPayload = formatActionPayload(action.type, action.payload);
      const entry: ActionLogEntry = {
        id: `log-${state.totalDispatchedCount}`,
        type: action.type,
        payload: action.payload,
        formattedPayload,
        displayText: `[${action.type}] -> ${formattedPayload}`,
        timestamp: getCurrentTimeLabel(),
      };
      state.entries.unshift(entry);
      if (state.entries.length > MAX_ACTION_LOG_ENTRIES) {
        state.entries.length = MAX_ACTION_LOG_ENTRIES;
      }
    });
  },
});

export const { clearActionLog, recordManualAction } = actionLogSlice.actions;

export default actionLogSlice.reducer;

