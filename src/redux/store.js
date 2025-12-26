// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// We configure the store with our auth reducer
export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});