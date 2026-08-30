import { configureStore } from '@reduxjs/toolkit';
import rolesReducer from './slices/rolesSlice';
import speciesReducer from './slices/speciesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    roles: rolesReducer,
    species: speciesReducer,
    user: userReducer,
  },
});
