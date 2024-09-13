import React from "react";
import App from "./app";
import { GlobalProvider } from "../context/GlobalProvider";

export default function RootLayout() {
  // Fake value for now to prevent React Native warning
  const globalState = { test: "test" }

  return (
    <GlobalProvider value={globalState}>
      <App />
    </GlobalProvider>
  );
}
