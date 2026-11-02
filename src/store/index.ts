import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import statsReducer from './slices/statsSlice';
import inventoryReducer from './slices/inventorySlice';
import actionLogReducer from './slices/actionLogSlice';

export function createAppStore() {
  return configureStore({
    reducer: {
      stats: statsReducer,
      inventory: inventoryReducer,
      actionLog: actionLogReducer,
    },
  });
}

export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks tipados para usar en los componentes visuales
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

