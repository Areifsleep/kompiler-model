import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
