import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getVaccineSpecies } from '../../services/api';

// Thunk to fetch the list of pet species (GET /Vaccine/species) asynchronously
export const fetchSpecies = createAsyncThunk(
  'species/fetchSpecies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getVaccineSpecies();
      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.species)) {
        return response.species;
      }
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener las especies');
    }
  }
);

const speciesSlice = createSlice({
  name: 'species',
  initialState: {
    species: [],
    loading: false,
    error: null,
    hasFetched: false,
  },
  reducers: {
    clearSpecies: (state) => {
      state.species = [];
      state.loading = false;
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecies.fulfilled, (state, action) => {
        state.loading = false;
        state.species = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchSpecies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ocurrió un error';
      });
  },
});

export const { clearSpecies } = speciesSlice.actions;
export default speciesSlice.reducer;
