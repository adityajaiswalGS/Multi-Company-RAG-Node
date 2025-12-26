"use client";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { CircularProgress, Box } from "@mui/material";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      {/* PersistGate delays rendering until the token is recovered from storage */}
      <PersistGate 
        loading={
          <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        } 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}