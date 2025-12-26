// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,          // Stores { full_name, role, company_id }
    token: null,         // JWT for API calls
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Reducer for POST /api/auth/login
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            // Persistence is handled by redux-persist automatically later
        },
        // Reducer for POST /api/auth/logout
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        }
    }
});

export const { setLogin, setLogout } = authSlice.actions;
export default authSlice.reducer;