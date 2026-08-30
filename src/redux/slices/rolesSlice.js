import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRoles } from '../../services/api';

// Thunk to fetch roles asynchronously
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRoles();
      // Handle the cases where response is e.g. { roles: [...] } or direct array
      if (response && response.roles) {
        return response.roles;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener los roles');
    }
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    roles: [],
    loading: false,
    error: null,
    hasFetched: false,
  },
  reducers: {
    clearRoles: (state) => {
      state.roles = [];
      state.loading = false;
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ocurrió un error';
      });
  },
});

export const { clearRoles } = rolesSlice.actions;
export default rolesSlice.reducer;
