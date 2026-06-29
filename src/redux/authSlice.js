import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe, getCourses } from '../services/api';

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMe();
      return { user: data.user, courses: data.courses || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load user");
    }
  }
);

export const fetchCourses = createAsyncThunk(
  'auth/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getCourses();
      return data.courses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch courses");
    }
  }
);

const initialState = {
  user: null,
  token: "",
  isAuthenticated: false,
  loading: true, // Start with loading true for persistence check
  courses: [],
  role: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.courses = action.payload.courses || [];
      state.role = action.payload.user.role;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = "";
      state.isAuthenticated = false;
      state.courses = [];
      state.role = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.courses = action.payload.courses;
        state.isAuthenticated = true;
        state.role = action.payload.user.role;
        state.loading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.loading = false;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      });
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
