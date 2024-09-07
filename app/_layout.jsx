import React from "react";
import App from "./app";
import { GlobalProvider } from "../context/GlobalProvider";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <App />
    </GlobalProvider>
  );
}
