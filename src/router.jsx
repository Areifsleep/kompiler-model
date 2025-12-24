import { createBrowserRouter } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";

import ParsingPage from "@/features/parsers/pages/parser-page";
import TranslationPage from "@/features/translations/pages/translation-page";
import VisualizationPage from "@/features/visualizatations/pages/visualization-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
