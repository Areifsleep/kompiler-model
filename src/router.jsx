import { createBrowserRouter } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import { ModelProvider } from "@/contexts/ModelContext";

import ParsingPage from "@/features/parsers/pages/parser-page";
import TranslationPage from "@/features/translations/pages/translation-page";
import VisualizationPage from "@/features/visualizatations/pages/visualization-page";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ThemeProvider
        defaultTheme="dark"
        storageKey="vite-ui-theme"
      >
        <Toaster position="top-right" />
        <ModelProvider>
          <MainLayout />
        </ModelProvider>
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "parsing",
        element: <ParsingPage />,
      },
      {
        path: "visualization",
        element: <VisualizationPage />,
      },
      {
        path: "translation",
        element: <TranslationPage />,
      },
    ],
  },
]);
