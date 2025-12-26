// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,          // Stores { id, full_name, role, company_id }
    token: null,         // JWT for API calls
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Triggered after successful POST /api/auth/login
         * action.payload should be { user: {...}, token: "..." }
         */
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            // Persistence is handled by redux-persist in store.js
        },

        /**
         * Useful for production to update user details without logging out
         */
        setUpdateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },

        /**
         * Clears all state and triggers local storage removal via redux-persist
         */
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        }
    }
});

export const { setLogin, setLogout, setUpdateUser } = authSlice.actions;
export default authSlice.reducer;