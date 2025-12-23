import { createBrowserRouter } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Parsing from "@/pages/Parsing";
import Visualization from "@/pages/Visualization";
import Translation from "@/pages/Translation";

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
        element: <Parsing />,
      },
      {
        path: "visualization",
        element: <Visualization />,
      },
      {
        path: "translation",
        element: <Translation />,
      },
    ],
  },
]);
