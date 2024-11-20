import "./style.css";

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Session from "./pages/Session";
import Main from "./pages/Main";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/session",
    element: <Session />,
  },
]);

ReactDOM.createRoot(
  document.getElementById("react-ui") as HTMLDivElement
).render(<RouterProvider router={router} />);
