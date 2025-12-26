"use client"; // This tells Next.js this file is for the browser

import { Provider } from "react-redux";
import { store } from "./store";

export function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}